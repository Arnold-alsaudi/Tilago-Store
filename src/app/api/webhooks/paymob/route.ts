import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { notifyAllChannels } from '@/lib/notify';
import { PLANS } from '@/lib/subscription';
import { activateSubscription, planFromProductName } from '@/lib/subscriptionActivate';

// ترتيب الحقول اللي بايموب بيوقّع عليه — بالترتيب ده بالظبط ومن غير أي تغيير.
// لاحظ المسارات المتداخلة: order.id و source_data.* — مش order ولا source_data_pan.
const HMAC_FIELDS = [
  'amount_cents', 'created_at', 'currency', 'error_occured',
  'has_parent_transaction', 'id', 'integration_id', 'is_3d_secure',
  'is_auth', 'is_capture', 'is_refunded', 'is_standalone_payment',
  'is_voided', 'order.id', 'owner', 'pending',
  'source_data.pan', 'source_data.sub_type', 'source_data.type', 'success',
];

/**
 * بيقرأ قيمة بمسار متداخل ("order.id") مع دعم الشكل المسطّح ("order" كرقم،
 * أو "source_data_pan") — بايموب بيبعت الـ POST متداخل والـ redirect مسطّح،
 * فبندعم الاتنين بدل ما نفترض شكل واحد.
 */
function pick(obj: Record<string, unknown>, path: string): string {
  const nested = path.split('.').reduce<unknown>(
    (acc, part) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined),
    obj,
  );
  if (nested !== undefined && nested !== null && typeof nested !== 'object') return String(nested);

  // احتياطي: "order" لوحده لو كان رقم، و"source_data_pan" بالشرطة السفلية
  const flat = obj[path.replace(/\./g, '_')] ?? obj[path.split('.')[0]];
  if (flat !== undefined && flat !== null && typeof flat !== 'object') return String(flat);

  return '';
}

function verifyPaymobHmac(data: Record<string, unknown>, receivedHmac: string): boolean {
  const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  if (!hmacSecret) {
    console.error('[Webhook] PAYMOB_HMAC_SECRET غير مضبوط — كل الإشعارات هتترفض');
    return false; // بدون سر مُعدّ، نرفض بدل ما نثق تلقائياً
  }
  if (!receivedHmac) return false;

  const concatenated = HMAC_FIELDS.map(f => pick(data, f)).join('');
  const expected = crypto.createHmac('sha512', hmacSecret).update(concatenated).digest('hex');

  try {
    const ok = crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(receivedHmac, 'hex'));
    if (!ok) {
      // من غير اللوج ده، فشل التوقيع كان بيعدّي صامت والدفعة بتضيع
      console.error('[Webhook] التوقيع مش مطابق — راجع PAYMOB_HMAC_SECRET. الحقول المقروءة:',
        JSON.stringify(Object.fromEntries(HMAC_FIELDS.map(f => [f, pick(data, f)]))));
    }
    return ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const hmac = req.nextUrl.searchParams.get('hmac') ?? '';
  const obj = body?.obj ?? {};

  // HMAC إجباري دايماً — أي طلب من غيره أو بتوقيع غلط يترفض فوراً
  if (!verifyPaymobHmac(obj, hmac)) {
    console.error('[Webhook] Invalid or missing HMAC');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  const success: boolean = obj.success === true || obj.success === 'true';
  const pending: boolean = obj.pending === true || obj.pending === 'true';

  if (!success || pending) {
    return NextResponse.json({ received: true, status: 'ignored' });
  }

  const referenceId = String(obj.id ?? '');
  const amountCents: number = Number(obj.amount_cents ?? 0);
  const currency: string = obj.currency ?? 'EGP';
  const billing = obj.order?.billing_data ?? obj.payment_key_claims?.billing_data ?? {};

  // البيانات اللي بعتناها إحنا في `extras` بترجع تحت payment_key_claims.extra.
  // لازم تيجي **الأول** — `merchant_order_id` بتملاه بايموب برقمها هي، فلو
  // قدّمناه هيطلع اسم المنتج رقم مبهم بدل اسم حقيقي.
  const extra = obj.payment_key_claims?.extra ?? {};
  const productName =
    extra.productName || extra.alertId || obj.order?.merchant_order_id || 'طلب Tilago';

  const customerName = `${billing.first_name ?? ''} ${billing.last_name ?? ''}`.trim() || 'عميل Tilago';
  const customerEmail = extra.customerEmail || billing.email || 'unknown@tilago.io';
  const customerPhone = String(billing.phone_number ?? '').trim();
  const paidAt = new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' });

  // بايموب بيعيد إرسال نفس الويبهوك. بنشوف الدفعة كانت متسجّلة قبل كده ولا لأ،
  // عشان الإشعار مايتبعتش مرتين والاشتراك مايتمدّش مرتين.
  const before = await prisma.payment.findUnique({
    where: { id: referenceId },
    select: { status: true, deliveryStatus: true },
  }).catch(() => null);
  const firstTime = before?.status !== 'success';

  // حفظ في قاعدة البيانات
  await prisma.payment.upsert({
    where: { id: referenceId },
    update: { status: 'success' },
    create: {
      id: referenceId,
      userEmail: customerEmail,
      userName: customerName,
      userPhone: customerPhone,
      amount: amountCents / 100,
      currency,
      method: 'paymob',
      status: 'success',
      productName,
    },
  });

  // ── اشتراك أوفرلي: التفعيل لوحده ─────────────────────────────
  // الدفع بالكارت متأكَّد منه بالتوقيع، فمفيش داعي حد يضغط زرار. العلامة
  // "تم التسليم" على الدفعة هي اللي بتمنع التفعيل يتكرر مع إعادة الإرسال —
  // ولو التفعيل فشل بنرجّع خطأ عشان بايموب يعيد، والمرة الجاية يتفعّل.
  const plan = planFromProductName(productName);
  if (plan && before?.deliveryStatus !== 'delivered') {
    const paid = amountCents / 100;
    const validEmail = customerEmail.includes('@') && customerEmail !== 'unknown@tilago.io';
    if (!validEmail) {
      console.error(`[Webhook] اشتراك من غير إيميل صالح: ${referenceId}`);
    } else if (paid + 0.001 < PLANS[plan].price) {
      // المبلغ اللي اتدفع أقل من سعر الخطة — منفعّلش، وانت تشوفه من الأدمن
      console.error(`[Webhook] مبلغ الاشتراك ناقص: ${paid} < ${PLANS[plan].price} · ${referenceId}`);
    } else {
      try {
        await activateSubscription(customerEmail, plan, paid);
        await prisma.payment.update({ where: { id: referenceId }, data: { deliveryStatus: 'delivered' } });
        console.log(`[Webhook] اشتراك ${plan} اتفعّل لـ ${customerEmail}`);
      } catch (err) {
        console.error('[Webhook] فشل تفعيل الاشتراك', err);
        return NextResponse.json({ error: 'activation failed' }, { status: 500 });
      }
    }
  }

  if (!firstTime) {
    return NextResponse.json({ received: true, status: 'duplicate' });
  }

  // إرسال الإشعارات لكل القنوات
  await notifyAllChannels({
    customerName,
    customerEmail,
    customerPhone,
    productName,
    amount: amountCents / 100,
    currency,
    referenceId,
    paymentMethod: 'Paymob (Meeza/Visa/Mastercard)',
    paidAt,
  });

  console.log(`[Webhook] ✅ Payment confirmed & notifications sent: ${referenceId}`);
  return NextResponse.json({ received: true, status: 'recorded' });
}

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { notifyAllChannels } from '@/lib/notify';

function verifyPaymobHmac(data: Record<string, string>, receivedHmac: string): boolean {
  const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  if (!hmacSecret) return true; // في التطوير نسمح بدون HMAC

  const keys = [
    'amount_cents', 'created_at', 'currency', 'error_occured',
    'has_parent_transaction', 'id', 'integration_id', 'is_3d_secure',
    'is_auth', 'is_capture', 'is_refunded', 'is_standalone_payment',
    'is_voided', 'order', 'owner', 'pending',
    'source_data_pan', 'source_data_sub_type', 'source_data_type', 'success',
  ];

  const concatenated = keys.map(k => data[k] ?? '').join('');
  const expected = crypto.createHmac('sha512', hmacSecret).update(concatenated).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(receivedHmac, 'hex'));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const hmac = req.nextUrl.searchParams.get('hmac') ?? '';
  const obj = body?.obj ?? {};

  if (hmac && !verifyPaymobHmac(obj, hmac)) {
    console.error('[Webhook] Invalid HMAC');
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
  const extras = obj.order?.merchant_order_id ?? obj.payment_key_claims?.extra?.alertId ?? '';

  const customerName = `${billing.first_name ?? ''} ${billing.last_name ?? ''}`.trim() || 'عميل Tilago';
  const customerEmail = billing.email ?? 'unknown@tilago.io';
  const customerPhone = String(billing.phone_number ?? '').trim();
  const paidAt = new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' });

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
      productName: extras,
    },
  });

  // إرسال الإشعارات لكل القنوات
  await notifyAllChannels({
    customerName,
    customerEmail,
    customerPhone,
    productName: extras || 'Alert',
    amount: amountCents / 100,
    currency,
    referenceId,
    paymentMethod: 'Paymob (Meeza/Visa/Mastercard)',
    paidAt,
  });

  console.log(`[Webhook] ✅ Payment confirmed & notifications sent: ${referenceId}`);
  return NextResponse.json({ received: true, status: 'recorded' });
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/getClientIp';
import { notifyPendingPayment } from '@/lib/notify';
import { PLANS, type PlanKey } from '@/lib/subscription';
import { overlayProductName } from '@/lib/subscriptionActivate';

/**
 * طلب اشتراك في Tilago Overlay.
 *
 * طريقتين:
 *  - paymob (فيزا/ميزا): بيرجّع رابط صفحة الدفع. الويبهوك الموقّع بيسجّل
 *    الدفعة ويفعّل الاشتراك لوحده — مفيش حد محتاج يضغط زرار.
 *  - PayPal: بيسجّل الدفعة "مستنية تأكيد" ويبعتلك على البوت، وانت بتفعّل
 *    من الأدمن بعد ما تتأكد إن الفلوس وصلت، لأن paypal.me مالوش تأكيد تلقائي.
 *
 * السعر بيتحسب هنا من الخطة — أي مبلغ من المتصفح بيتجاهل.
 */

const PAYMOB_API = 'https://accept.paymob.com/v1';

const schema = z.object({
  plan:   z.enum(['m1', 'm3', 'y']),
  method: z.enum(['paymob', 'PayPal']),
  phone:  z.string().trim().min(8).max(20),
});

export async function POST(req: NextRequest) {
  const { success } = await rateLimit(getClientIp(req), 5, 60_000);
  if (!success) return NextResponse.json({ error: 'محاولات كتير، استنى دقيقة' }, { status: 429 });

  const paused = await prisma.siteSetting.findUnique({ where: { key: 'storePaused' } }).catch(() => null);
  if (paused?.value === 'true') {
    return NextResponse.json({ error: 'الطلبات متوقفة مؤقتاً' }, { status: 503 });
  }

  // الاشتراك مربوط بالإيميل، فمن غير دخول مش هنعرف نفعّل لمين
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'بيانات ناقصة أو غلط' }, { status: 400 });

  const { plan, method, phone } = parsed.data;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) {
    return NextResponse.json({ error: 'رقم الموبايل مش صحيح' }, { status: 400 });
  }

  const amount = PLANS[plan as PlanKey].price;
  const productName = overlayProductName(plan as PlanKey);
  const customerName = session?.user?.name ?? 'عميل';

  /* ── بايموب ─────────────────────────────────────────────── */
  if (method === 'paymob') {
    const secretKey = process.env.PAYMOB_SECRET_KEY;
    const publicKey = process.env.PAYMOB_PUBLIC_KEY;
    const integrationIds = (process.env.PAYMOB_INTEGRATION_IDS ?? process.env.PAYMOB_INTEGRATION_ID ?? '')
      .split(',').map(s => Number(s.trim())).filter(n => n && !Number.isNaN(n));

    if (!secretKey || !publicKey || integrationIds.length === 0) {
      return NextResponse.json({ error: 'الدفع بالكارت مش متاح دلوقتي، استخدم PayPal' }, { status: 503 });
    }

    const piasters = amount * 100;
    const body = {
      amount: piasters,
      currency: process.env.PAYMOB_CURRENCY ?? 'EGP',
      payment_methods: integrationIds,
      items: [{ name: productName.slice(0, 50), amount: piasters, description: productName, quantity: 1 }],
      billing_data: {
        first_name: customerName.slice(0, 40),
        last_name: 'Tilago',
        email,
        phone_number: digits,
      },
      // الويبهوك بيقرا اسم المنتج والإيميل من هنا — العلامة [OVL:plan] هي
      // اللي بتخليه يعرف إن دي دفعة اشتراك ويفعّلها
      extras: { productName, customerEmail: email },
      redirection_url: `${process.env.NEXTAUTH_URL}/overlay?payment=success`,
    };

    try {
      const res = await fetch(`${PAYMOB_API}/intention/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${secretKey}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data?.client_secret) {
        console.error('[overlay/paymob]', res.status, JSON.stringify(data));
        return NextResponse.json({ error: 'بايموب رفض الطلب، جرّب تاني' }, { status: 502 });
      }
      return NextResponse.json({
        url: `https://accept.paymob.com/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${data.client_secret}`,
      });
    } catch (err) {
      console.error('[overlay/paymob] fetch', err);
      return NextResponse.json({ error: 'مفيش اتصال ببايموب' }, { status: 502 });
    }
  }

  /* ── PayPal ─────────────────────────────────────────────── */
  // الضغط مرتين أو الرجوع من PayPal كان بيسجّل نفس الطلب أكتر من مرة
  const duplicate = await prisma.payment.findFirst({
    where: {
      userEmail: email, productName, status: 'pending',
      createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
    },
    select: { id: true },
  }).catch(() => null);

  if (!duplicate) {
    try {
      await prisma.payment.create({
        data: {
          userEmail: email, userName: customerName, userPhone: digits,
          productName, amount, currency: 'EGP', method: 'PayPal',
          status: 'pending', deliveryStatus: 'pending',
        },
      });
    } catch {
      return NextResponse.json({ error: 'حصل خطأ، جرّب تاني' }, { status: 500 });
    }
    await notifyPendingPayment({
      productName, amount, currency: 'EGP',
      customerName, customerEmail: email, customerPhone: digits, method: 'PayPal',
    });
  }

  return NextResponse.json({ amount, paypalHandle: process.env.NEXT_PUBLIC_PAYPAL_ME || null });
}

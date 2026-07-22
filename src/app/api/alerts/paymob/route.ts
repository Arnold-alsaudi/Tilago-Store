import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { prisma } from '@/lib/prisma';

const PAYMOB_API = 'https://accept.paymob.com/v1';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await rateLimit(ip, 10, 60_000);
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  // التحقق من أن الشراء غير متوقف
  const paused = await prisma.siteSetting.findUnique({ where: { key: 'storePaused' } });
  if (paused?.value === 'true') {
    return NextResponse.json({ error: 'الطلبات متوقفة مؤقتاً' }, { status: 503 });
  }

  const { name, amount, alertId, phone } = await req.json();
  if (!name || !amount || !alertId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  // رقم موبايل العميل للتواصل — مطلوب
  const customerPhone = String(phone ?? '').trim();
  if (!customerPhone || customerPhone.replace(/\D/g, '').length < 8) {
    return NextResponse.json({ error: 'رقم الموبايل مطلوب للتواصل معك' }, { status: 400 });
  }

  const secretKey = process.env.PAYMOB_SECRET_KEY!;
  // كل طرق الدفع والمحافظ المفعّلة على الحساب: كروت / ميزة / فودافون كاش / انستاباي...
  // ضع كل الـ Integration IDs مفصولة بفواصل في PAYMOB_INTEGRATION_IDS
  const integrationIds = (process.env.PAYMOB_INTEGRATION_IDS ?? process.env.PAYMOB_INTEGRATION_ID ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter(n => !Number.isNaN(n));

  if (integrationIds.length === 0) {
    console.error('[Paymob] No integration IDs configured');
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
  }

  const returnUrl = alertId === 'cart'
    ? `${process.env.NEXTAUTH_URL}/orders/success`
    : `${process.env.NEXTAUTH_URL}/alerts?payment=success&alertId=${encodeURIComponent(alertId)}`;

  const amountPiasters = Math.round(Number(amount) * 100);
  const body = {
    amount: amountPiasters,
    currency: process.env.PAYMOB_CURRENCY ?? 'EGP',
    payment_methods: integrationIds,
    items: [{
      name: `Tilago Alert - ${name}`,
      amount: amountPiasters,
      description: name,
      quantity: 1,
    }],
    billing_data: {
      first_name: name.slice(0, 40) || 'Customer',
      last_name: 'Tilago',
      email: 'customer@tilago.io',
      phone_number: customerPhone,
    },
    extras: { alertId },
    redirection_url: returnUrl,
  };

  console.log('[Paymob] Sending intention:', JSON.stringify(body));
  console.log('[Paymob] Integration IDs:', integrationIds.join(','));

  try {
    const res = await fetch(`${PAYMOB_API}/intention/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${secretKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log('[Paymob] Response status:', res.status, '| Body:', JSON.stringify(data));

    if (!res.ok) return NextResponse.json({ error: data }, { status: 500 });

    const clientSecret = data.client_secret;
    if (!clientSecret) {
      console.error('[Paymob] No client_secret in response:', data);
      return NextResponse.json({ error: 'No client_secret returned', detail: data }, { status: 500 });
    }

    const publicKey = process.env.PAYMOB_PUBLIC_KEY!;
    const paymentUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${clientSecret}`;

    return NextResponse.json({ url: paymentUrl });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Paymob] Fetch error:', msg);
    return NextResponse.json({ error: 'Paymob connection failed', detail: msg }, { status: 500 });
  }
}

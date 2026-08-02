import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { prisma } from '@/lib/prisma';

const PAYMOB_API = 'https://accept.paymob.com/v1';

// السعر الحقيقي بييجي من قاعدة البيانات دايماً — أي amount جاي من العميل بيتجاهل
async function computeTrustedAmount(
  alertId: string,
  cartItems: { productId: string; quantity: number }[] | undefined,
): Promise<{ amount: number; error?: string }> {
  if (alertId === 'cart') {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return { amount: 0, error: 'Cart items required' };
    }
    const ids = cartItems.map(i => String(i?.productId));
    const products = await prisma.product.findMany({ where: { id: { in: ids }, active: true } });
    const byId = new Map(products.map(p => [p.id, p]));

    let total = 0;
    for (const i of cartItems) {
      const product = byId.get(String(i?.productId));
      if (!product) return { amount: 0, error: 'Invalid product in cart' };
      const quantity = Math.max(1, Math.floor(Number(i?.quantity) || 1));
      total += product.price * quantity;
    }
    return { amount: total };
  }

  const product = await prisma.product.findFirst({
    where: { OR: [{ id: alertId }, { slug: alertId }], active: true },
  });
  if (!product) return { amount: 0, error: 'Product not found' };
  return { amount: product.price };
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await rateLimit(ip, 10, 60_000);
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  // التحقق من أن الشراء غير متوقف
  const paused = await prisma.siteSetting.findUnique({ where: { key: 'storePaused' } });
  if (paused?.value === 'true') {
    return NextResponse.json({ error: 'الطلبات متوقفة مؤقتاً' }, { status: 503 });
  }

  const { name, alertId, phone, items: cartItems } = await req.json();
  if (!name || !alertId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  // رقم موبايل العميل للتواصل — مطلوب
  const customerPhone = String(phone ?? '').trim();
  if (!customerPhone || customerPhone.replace(/\D/g, '').length < 8) {
    return NextResponse.json({ error: 'رقم الموبايل مطلوب للتواصل معك' }, { status: 400 });
  }

  // ── السعر الحقيقي من قاعدة البيانات — نتجاهل أي amount جاي من العميل ──
  const { amount, error: amountError } = await computeTrustedAmount(String(alertId), cartItems);
  if (amountError || amount <= 0) {
    return NextResponse.json({ error: amountError ?? 'Invalid amount' }, { status: 400 });
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

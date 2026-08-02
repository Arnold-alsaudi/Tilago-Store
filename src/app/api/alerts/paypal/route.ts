import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  name:    z.string().min(1).max(200),
  alertId: z.string().min(1).max(100),
});

// sandbox افتراضياً — للإنتاج ضع PAYPAL_API_BASE=https://api-m.paypal.com
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE ?? 'https://api-m.sandbox.paypal.com';

async function getPayPalToken() {
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token as string;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await rateLimit(ip, 10, 60_000);
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const paused = await prisma.siteSetting.findUnique({ where: { key: 'storePaused' } });
  if (paused?.value === 'true') {
    return NextResponse.json({ error: 'الطلبات متوقفة مؤقتاً' }, { status: 503 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const { name, alertId } = parsed.data;

  // السعر الحقيقي من قاعدة البيانات — نتجاهل أي amount جاي من العميل
  const product = await prisma.product.findFirst({
    where: { OR: [{ id: alertId }, { slug: alertId }], active: true },
  });
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  const amount = product.price;

  try {
    const token = await getPayPalToken();

    const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          // PayPal لا يدعم EGP كعملة تسوية — العملة قابلة للضبط عبر PAYPAL_CURRENCY
          amount: { currency_code: process.env.PAYPAL_CURRENCY ?? 'USD', value: Number(amount).toFixed(2) },
          description: `Tilago Alert — ${name}`,
        }],
        application_context: {
          return_url: `${process.env.NEXTAUTH_URL}/alerts?payment=success`,
          cancel_url: `${process.env.NEXTAUTH_URL}/alerts?payment=cancelled`,
          brand_name: 'Tilago',
        },
      }),
    });

    const order = await res.json();
    if (!res.ok) return NextResponse.json({ error: order }, { status: 500 });

    const approveUrl = order.links?.find((l: any) => l.rel === 'approve')?.href;
    return NextResponse.json({ id: order.id, approveUrl });
  } catch (err) {
    return NextResponse.json({ error: 'PayPal connection failed' }, { status: 500 });
  }
}

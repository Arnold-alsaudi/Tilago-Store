import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { items } = await req.json();
  if (!items?.length) return NextResponse.json({ error: 'No items' }, { status: 400 });

  // السعر بييجي من قاعدة البيانات دايماً — نتجاهل أي سعر جاي من العميل
  const ids = items.map((i: any) => String(i?.product?.id));
  const products = await prisma.product.findMany({ where: { id: { in: ids }, active: true } });
  const byId = new Map(products.map(p => [p.id, p]));

  let total = 0;
  for (const i of items) {
    const product = byId.get(String(i?.product?.id));
    if (!product) return NextResponse.json({ error: 'Invalid product in cart' }, { status: 400 });
    const quantity = Math.max(1, Math.floor(Number(i?.quantity) || 1));
    total += product.price * quantity;
  }

  const token = await getPayPalToken();

  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: process.env.PAYPAL_CURRENCY ?? 'USD', value: total.toFixed(2) },
        description: 'Tilago Order',
      }],
      application_context: {
        return_url: `${process.env.NEXTAUTH_URL}/orders/success`,
        cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
        brand_name: 'Tilago',
      },
    }),
  });

  const order = await res.json();
  return NextResponse.json(order);
}

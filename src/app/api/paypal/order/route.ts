import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getPayPalToken() {
  const res = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
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
  const total = items.reduce((s: number, i: any) => s + i.product.price * i.quantity, 0);

  const token = await getPayPalToken();

  const res = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: 'USD', value: total.toFixed(2) },
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

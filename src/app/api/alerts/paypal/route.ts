import { NextRequest, NextResponse } from 'next/server';

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
  const { name, amount } = await req.json();
  if (!name || !amount) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

  try {
    const token = await getPayPalToken();

    const res = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: 'SAR', value: Number(amount).toFixed(2) },
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

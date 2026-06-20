import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { name, amount, mobile } = await req.json();
  if (!name || !amount || !mobile) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  const merchantCode = process.env.FAWRY_MERCHANT_CODE!;
  const securityKey = process.env.FAWRY_SECURITY_KEY!;
  const baseUrl = process.env.FAWRY_BASE_URL || 'https://atfawry.fawrystaging.com';

  const merchantRefNum = `tilago-${Date.now()}`;
  const itemId = 'alert-item';
  const price = Number(amount).toFixed(2);
  const quantity = 1;

  const signature = crypto
    .createHash('sha256')
    .update(
      merchantCode +
      merchantRefNum +
      mobile +
      itemId +
      quantity +
      price +
      securityKey
    )
    .digest('hex');

  try {
    const res = await fetch(`${baseUrl}/ECommerceWeb/Fawry/payments/charge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchantCode,
        merchantRefNum,
        customerMobile: mobile,
        customerProfileId: mobile,
        paymentMethod: 'CARD',
        amount: price,
        currencyCode: 'EGP',
        language: 'ar-eg',
        chargeItems: [{ itemId, description: `Tilago Alert — ${name}`, price, quantity }],
        returnUrl: `${process.env.NEXTAUTH_URL}/alerts?payment=success`,
        signature,
      }),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: 500 });

    const paymentUrl = data.paymentURL ?? data.redirectUri ?? data.nextAction?.redirectUrl;
    if (!paymentUrl) return NextResponse.json({ error: 'No payment URL returned', raw: data }, { status: 500 });

    return NextResponse.json({ url: paymentUrl });
  } catch (err) {
    return NextResponse.json({ error: 'Fawry connection failed' }, { status: 500 });
  }
}

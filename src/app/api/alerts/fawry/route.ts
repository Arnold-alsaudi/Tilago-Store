import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  name:    z.string().min(1).max(200),
  amount:  z.number().positive().max(100_000),
  alertId: z.string().min(1).max(100),
});

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

  const { name, amount, alertId } = parsed.data;

  const merchantCode = process.env.FAWRY_MERCHANT_CODE!;
  const securityKey = process.env.FAWRY_SECURITY_KEY!;
  const baseUrl = process.env.FAWRY_BASE_URL || 'https://atfawry.fawrystaging.com';

  const merchantRefNum = `tilago-${alertId}-${Date.now()}`;
  const itemId = alertId;
  const price = Number(amount).toFixed(2);
  const quantity = 1;

  // Card-only hosted checkout: no customer mobile / reference code required.
  const signature = crypto
    .createHash('sha256')
    .update(
      merchantCode +
      merchantRefNum +
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
        paymentMethod: 'CARD',
        paymentExpiry: '',
        amount: price,
        currencyCode: 'EGP',
        language: 'ar-eg',
        chargeItems: [{ itemId, description: `Tilago Alert — ${name}`, price, quantity }],
        returnUrl: `${process.env.NEXTAUTH_URL}/alerts?payment=success&alertId=${encodeURIComponent(alertId)}`,
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

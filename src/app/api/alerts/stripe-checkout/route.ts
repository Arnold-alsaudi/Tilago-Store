import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/getClientIp';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

const schema = z.object({
  name:   z.string().min(1).max(200),
  amount: z.number().positive().max(100_000),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimit(ip, 10, 60_000);
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const paused = await prisma.siteSetting.findUnique({ where: { key: 'storePaused' } });
  if (paused?.value === 'true') {
    return NextResponse.json({ error: 'الطلبات متوقفة مؤقتاً' }, { status: 503 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const { name, amount } = parsed.data;

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'sar',
          product_data: { name: `Tilago Alert — ${name}` },
          unit_amount: Math.round(Number(amount) * 100),
        },
        quantity: 1,
      }],
      success_url: `${process.env.NEXTAUTH_URL}/alerts?payment=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/alerts?payment=cancelled`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    return NextResponse.json({ error: 'Stripe connection failed' }, { status: 500 });
  }
}

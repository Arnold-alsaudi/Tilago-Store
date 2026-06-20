import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const { name, amount } = await req.json();
  if (!name || !amount) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

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

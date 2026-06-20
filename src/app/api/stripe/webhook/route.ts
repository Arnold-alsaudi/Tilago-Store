import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmation } from '@/lib/resend';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, items: itemsJson } = session.metadata!;
    const items = JSON.parse(itemsJson);

    const order = await prisma.order.create({
      data: {
        userId,
        status: 'PAID',
        total: (session.amount_total ?? 0) / 100,
        paymentMethod: 'stripe',
        stripeSessionId: session.id,
        paymentId: session.payment_intent as string,
        items: {
          create: items.map((i: any) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      },
      include: { user: true, items: { include: { product: true } } },
    });

    if (order.user.email && order.user.name) {
      await sendOrderConfirmation(
        order.user.email,
        order.user.name,
        order.id,
        order.total,
        order.items.map(i => ({ title: i.product.title, price: i.price }))
      ).catch(console.error);
    }
  }

  return NextResponse.json({ received: true });
}

export const dynamic = 'force-dynamic';

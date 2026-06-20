import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { items } = await req.json();
  if (!items?.length) return NextResponse.json({ error: 'No items' }, { status: 400 });

  const lineItems = items.map((item: any) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.product.title,
        images: item.product.imageUrl ? [item.product.imageUrl] : [],
        description: item.product.description?.slice(0, 200),
      },
      unit_amount: Math.round(item.product.price * 100),
    },
    quantity: item.quantity,
  }));

  const userId = (session.user as any).id;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: `${process.env.NEXTAUTH_URL}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
    customer_email: session.user.email!,
    metadata: {
      userId,
      items: JSON.stringify(items.map((i: any) => ({ productId: i.product.id, quantity: i.quantity, price: i.product.price }))),
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}

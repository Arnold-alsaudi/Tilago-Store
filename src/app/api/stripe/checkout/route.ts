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

  // السعر والتفاصيل بتيجي من قاعدة البيانات دايماً — نتجاهل أي بيانات منتج جاية من العميل
  const ids = items.map((i: any) => String(i?.product?.id));
  const products = await prisma.product.findMany({ where: { id: { in: ids }, active: true } });
  const byId = new Map(products.map(p => [p.id, p]));

  const trustedItems: { productId: string; quantity: number; price: number }[] = [];
  for (const i of items) {
    const product = byId.get(String(i?.product?.id));
    if (!product) return NextResponse.json({ error: 'Invalid product in cart' }, { status: 400 });
    const quantity = Math.max(1, Math.floor(Number(i?.quantity) || 1));
    trustedItems.push({ productId: product.id, quantity, price: product.price });
  }

  const lineItems = trustedItems.map(item => {
    const product = byId.get(item.productId)!;
    return {
      price_data: {
        currency: process.env.STRIPE_CURRENCY ?? 'egp',
        product_data: {
          name: product.title,
          images: product.imageUrl ? [product.imageUrl] : [],
          description: product.description?.slice(0, 200),
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: item.quantity,
    };
  });

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
      items: JSON.stringify(trustedItems),
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}

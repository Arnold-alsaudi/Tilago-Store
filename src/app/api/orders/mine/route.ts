import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  const payments = await prisma.payment.findMany({
    where: { userEmail: email },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      productName: true,
      amount: true,
      currency: true,
      method: true,
      status: true,
      deliveryStatus: true,
      createdAt: true,
    },
  });

  return NextResponse.json(payments);
}

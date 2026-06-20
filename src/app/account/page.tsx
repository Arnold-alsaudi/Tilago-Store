import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AccountClient } from './AccountClient';

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  let orders: any[] = [];
  try {
    orders = await prisma.order.findMany({
      where: { userId: (session.user as any).id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  } catch {}

  return <AccountClient user={session.user as any} orders={orders} />;
}

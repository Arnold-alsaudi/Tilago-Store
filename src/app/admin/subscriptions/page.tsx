import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SubscriptionsClient, { type AdminSub } from './SubscriptionsClient';

export default async function AdminSubscriptionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/');

  let items: AdminSub[] = [];
  let pendingPayments: { id: string; userEmail: string; userName: string | null;
                         amount: number; method: string; createdAt: string }[] = [];

  try {
    const [subs, pays] = await Promise.all([
      prisma.subscription.findMany({ orderBy: [{ updatedAt: 'desc' }] }),
      // تحويلات مستنية تأكيد — دي اللي البوت بيقولك عليها
      prisma.payment.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, userEmail: true, userName: true, amount: true,
                  method: true, createdAt: true },
      }),
    ]);

    items = subs.map(s => ({
      id: s.id,
      userEmail: s.userEmail,
      plan: s.plan,
      status: s.status,
      startsAt: s.startsAt?.toISOString() ?? null,
      endsAt: s.endsAt?.toISOString() ?? null,
      token: s.token,
      priceLocked: s.priceLocked,
      updatedAt: s.updatedAt.toISOString(),
    }));

    pendingPayments = pays.map(p => ({
      id: p.id, userEmail: p.userEmail, userName: p.userName,
      amount: p.amount, method: p.method, createdAt: p.createdAt.toISOString(),
    }));
  } catch {}

  return <SubscriptionsClient items={items} pending={pendingPayments} />;
}

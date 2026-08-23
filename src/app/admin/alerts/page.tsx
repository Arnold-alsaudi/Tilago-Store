import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AlertsAdminClient } from './AlertsAdminClient';

export default async function AdminAlertsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/');

  let alerts: any[] = [];
  try {
    alerts = await prisma.product.findMany({
      where: { category: 'ALERTS' },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
  } catch {}

  return <AlertsAdminClient alerts={alerts} />;
}

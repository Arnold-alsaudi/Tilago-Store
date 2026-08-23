import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ThreeDAdminClient } from './ThreeDAdminClient';

export default async function Admin3DPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/');

  let items: any[] = [];
  try {
    items = await prisma.product.findMany({
      where: { category: 'THREE_D' },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
  } catch {}

  return <ThreeDAdminClient items={items} />;
}

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminStream } from './AdminStream';

export default async function AdminStreamPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/');

  let packages: any[] = [];
  try { packages = await prisma.product.findMany({ where: { category: 'STREAM' }, orderBy: { createdAt: 'desc' } }); } catch {}

  return <AdminStream packages={packages} />;
}

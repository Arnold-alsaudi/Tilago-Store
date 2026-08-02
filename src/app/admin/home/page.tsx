import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DEFAULT_HOME_CONTENT, type HomeContent } from '@/lib/homeContent';
import { AdminHome } from './AdminHome';

export default async function AdminHomePage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/');

  let content: HomeContent = DEFAULT_HOME_CONTENT;
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: 'homeContent' } });
    if (row) content = { ...DEFAULT_HOME_CONTENT, ...JSON.parse(row.value) };
  } catch {}

  return <AdminHome initial={JSON.parse(JSON.stringify(content))} />;
}

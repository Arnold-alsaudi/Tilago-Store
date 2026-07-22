import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import PubgAdminClient from './PubgAdminClient';

export default async function AdminPubgPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/');

  let packages: any[] = [];
  try {
    packages = await prisma.product.findMany({
      where: { category: 'PACKAGE', subCategory: 'pubg' },
      orderBy: { createdAt: 'desc' },
      select: { id:true, title:true, imageUrl:true, images:true, videos:true, featured:true, active:true },
    });
  } catch {}

  return <PubgAdminClient packages={packages} />;
}

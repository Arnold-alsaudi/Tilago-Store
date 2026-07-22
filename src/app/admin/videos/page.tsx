import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminVideos } from './AdminVideos';

export default async function AdminVideosPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/');

  let videos: any[] = [];
  try { videos = await prisma.product.findMany({ where: { category: 'VIDEO' }, orderBy: { createdAt: 'desc' } }); } catch {}

  return <AdminVideos videos={videos} />;
}

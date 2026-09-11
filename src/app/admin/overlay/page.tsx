import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OverlayAdminClient, { type AdminOverlay } from './OverlayAdminClient';

export default async function AdminOverlayPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/');

  let items: AdminOverlay[] = [];
  try {
    const rows = await prisma.overlay.findMany({
      orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }],
    });
    items = rows.map(r => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      description: r.description,
      category: r.category as AdminOverlay['category'],
      file: r.file,
      poster: r.poster,
      isFree: r.isFree,
      featured: r.featured,
      active: r.active,
      sort: r.sort,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch {}

  return <OverlayAdminClient items={items} />;
}

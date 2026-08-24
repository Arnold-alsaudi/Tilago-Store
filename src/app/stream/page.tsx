import { prisma } from '@/lib/prisma';
import StreamClient, { StreamPkg } from './StreamClient';

// نقرأ الباكدجات من قاعدة البيانات في كل طلب — علشان تعديلات الأدمن تظهر فوراً
export const dynamic = 'force-dynamic';

export default async function StreamPage() {
  let packages: StreamPkg[] = [];
  try {
    const products = await prisma.product.findMany({
      where: { category: 'STREAM', active: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
    packages = products.map(p => ({
      id:     p.id,
      nameAr: p.title,
      name:   p.description,
      cover:  p.imageUrl || (p.images?.[0] ?? ''),
      images: p.images ?? [],
      video:  p.videoUrl ?? undefined,
      available: !(p.tags ?? []).includes('unavailable'),
    }));
  } catch {}

  return <StreamClient packages={packages} />;
}

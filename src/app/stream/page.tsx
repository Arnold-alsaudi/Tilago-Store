import { prisma } from '@/lib/prisma';
import StreamClient, { StreamPkg } from './StreamClient';

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
    }));
  } catch {}

  return <StreamClient packages={packages} />;
}

import { prisma } from '@/lib/prisma';
import PubgClient, { PubgPkg } from './PubgClient';

export default async function PubgChampionshipPage() {
  let packages: PubgPkg[] = [];
  try {
    const products = await prisma.product.findMany({
      where: { category: 'PACKAGE', subCategory: 'pubg', active: true },
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

  return <PubgClient packages={packages} />;
}

import { prisma } from '@/lib/prisma';
import TdmClient, { TdmPkg } from './TdmClient';

export default async function TdmPage() {
  let packages: TdmPkg[] = [];
  try {
    const products = await prisma.product.findMany({
      where: { category: 'PACKAGE', subCategory: 'tdm', active: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
    packages = products.map(p => ({
      id: p.id,
      nameAr: p.title,
      name: p.description,
      cover: p.imageUrl || (p.images?.[0] ?? ''),
      images: p.images ?? [],
      video: p.videoUrl ?? undefined,
    }));
  } catch {}
  return <TdmClient packages={packages} />;
}

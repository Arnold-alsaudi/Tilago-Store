import { prisma } from '@/lib/prisma';
import ThreeDClient, { TDProduct } from './ThreeDClient';

// نقرأ من قاعدة البيانات في كل طلب — علشان تعديلات الأدمن تظهر فوراً
export const dynamic = 'force-dynamic';

export default async function ThreeDPage() {
  let products: TDProduct[] = [];
  try {
    const rows = await prisma.product.findMany({
      where: { category: 'THREE_D', active: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
    products = rows.map(p => ({
      id: p.id,
      name: p.title,
      desc: p.description,
      cat: p.subCategory ?? 'logo3d',
      badge: p.tags?.[0] || undefined,
      cover: p.imageUrl || (p.images?.[0] ?? ''),
      media: (p.images?.length ? p.images : (p.imageUrl ? [p.imageUrl] : [])),
    }));
  } catch {}

  return <ThreeDClient products={products} />;
}

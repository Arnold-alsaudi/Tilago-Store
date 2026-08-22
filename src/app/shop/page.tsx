import { prisma } from '@/lib/prisma';
import { ShopClient, type ShopItem } from './ShopClient';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  let items: ShopItem[] = [];
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
    items = products.map(p => ({
      id: p.id,
      ref: p.slug ?? p.id,
      title: p.title,
      price: p.price,
      priceLabel: p.priceLabel,
      image: p.images?.[0] || p.imageUrl || '',
      category: p.category as string,
      subCategory: p.subCategory,
      rating: p.rating,
      ratingCount: p.ratingCount,
      createdAt: p.createdAt.toISOString(),
    }));
  } catch { /* قاعدة البيانات غير متاحة — نعرض متجر فاضي */ }

  return <ShopClient items={items} />;
}

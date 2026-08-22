import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductClient } from './ProductClient';
import { RelatedSections, type MiniProduct } from './RelatedSections';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }], active: true },
  });
  if (!product) notFound();

  // نمرّر شكل مبسّط وآمن للتسلسل (Dates → strings)
  const p = {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    price: product.price,
    priceLabel: product.priceLabel,
    category: product.category as string,
    subCategory: product.subCategory,
    imageUrl: product.imageUrl,
    images: product.images ?? [],
    videoUrl: product.videoUrl,
    rating: product.rating,
    ratingCount: product.ratingCount,
    tags: product.tags ?? [],
  };

  // منتجات مرتبطة من نفس الفئة — للـ cross-sell
  const related = await prisma.product.findMany({
    where: { category: product.category, active: true, id: { not: product.id } },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    take: 10,
  });

  const toMini = (x: typeof product): MiniProduct => ({
    id: x.id,
    ref: x.slug ?? x.id,
    title: x.title,
    price: x.price,
    priceLabel: x.priceLabel,
    image: x.images?.[0] || x.imageUrl || '',
    category: x.category as string,
  });

  return (
    <>
      <ProductClient product={p} />
      <RelatedSections current={toMini(product)} related={related.map(toMini)} />
    </>
  );
}

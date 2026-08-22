import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductClient } from './ProductClient';

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

  return <ProductClient product={p} />;
}

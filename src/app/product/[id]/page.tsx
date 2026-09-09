import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductClient } from './ProductClient';
import { RelatedSections, type MiniProduct } from './RelatedSections';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // الرابط بيقبل الـ id أو الـ slug أو الكود — عشان /product/480O4 يفتح على طول
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }, { code: id.trim().toUpperCase() }],
      active: true,
    },
  });
  if (!product) notFound();

  // نمرّر شكل مبسّط وآمن للتسلسل (Dates → strings)
  const p = {
    id: product.id,
    slug: product.slug,
    code: product.code,
    colorKey: product.colorKey,
    comingSoon: product.comingSoon,
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

  // منتجات مرتبطة من نفس الفئة — للـ cross-sell.
  // بنستثني اللي لسه مش جاهز: كان بيظهر بزرار "أضف للسلة" شغّال وبعدين الدفع
  // يرفضه، فالعميل كان بياخد مفاجأة وحشة عند الدفع.
  const related = await prisma.product.findMany({
    where: {
      category: product.category,
      active: true,
      comingSoon: false,
      id: { not: product.id },
    },
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

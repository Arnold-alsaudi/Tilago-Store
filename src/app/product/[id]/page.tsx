import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductClient } from './ProductClient';
import { RelatedSections, type MiniProduct } from './RelatedSections';

// كانت 'force-dynamic' — يعني السيرفر كان بيبني الصفحة من الأول لكل زائر
// ويضرب الداتابيز مرتين في كل مرة (~1.3 ثانية). دلوقتي الصفحة بتتخزّن على
// سيرفرات Vercel القريبة من العميل، فـ 500 زائر مع بعض = استعلام واحد مش 500.
// الرقم ده مجرد شبكة أمان — لوحة الأدمن بتنادي revalidatePath عند أي تعديل،
// فالتغييرات بتظهر في نفس اللحظة مش بعد 5 دقايق.
export const revalidate = 300;

// الحقول اللي الواجهة بتستعملها فعلاً — كنا بنجيب كل الأعمدة من غير داعي
const CARD_FIELDS = {
  id: true, slug: true, code: true, title: true, price: true, priceLabel: true,
  images: true, imageUrl: true, category: true,
} as const;

/** نبني صفحات المنتجات وقت النشر عشان حتى أول زائر يلاقيها جاهزة */
export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { code: true, slug: true },
    });
    // نفس المنتج ممكن يتفتح بالكود أو بالـ slug — نجهّز الاتنين
    const ids = new Set<string>();
    for (const p of products) {
      if (p.code) ids.add(p.code);
      if (p.slug) ids.add(p.slug);
    }
    return [...ids].map(id => ({ id }));
  } catch {
    // لو الداتابيز مش متاحة وقت البناء، مانكسرش النشر —
    // الصفحات هتتبني عند أول زيارة بدل وقت النشر
    return [];
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // الرابط بيقبل الـ id أو الـ slug أو الكود — عشان /product/480O4 يفتح على طول
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }, { code: id.trim().toUpperCase() }],
      active: true,
    },
    select: {
      ...CARD_FIELDS,
      colorKey: true, comingSoon: true, description: true,
      subCategory: true, videoUrl: true, rating: true, ratingCount: true, tags: true,
    },
  });
  if (!product) notFound();

  // نمرّر شكل مبسّط وآمن للتسلسل
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
    select: CARD_FIELDS,
  });

  // نفس شكل CARD_FIELDS بالظبط — عشان المنتج الحالي والمشابه يعدّوا من نفس المحوّل
  type Card = {
    id: string; slug: string | null; code: string | null; title: string; price: number;
    priceLabel: string | null; images: string[]; imageUrl: string; category: string;
  };
  const toMini = (x: Card): MiniProduct => ({
    id: x.id,
    // الكود الأول — الروابط دي بتتبني وقت النشر، فالضغطة بتفتح فوراً.
    // الـ id الخام مش في القائمة المبنية مسبقاً فبيتكلّف تحميل كامل أول مرة.
    ref: x.code ?? x.slug ?? x.id,
    title: x.title,
    price: x.price,
    priceLabel: x.priceLabel,
    image: x.images[0] || x.imageUrl || '',
    category: x.category,
  });

  return (
    <>
      <ProductClient product={p} />
      <RelatedSections current={toMini(product)} related={related.map(toMini)} />
    </>
  );
}

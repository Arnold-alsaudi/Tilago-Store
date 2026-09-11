import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import OverlayClient, { type CatalogItem } from './OverlayClient';

export const metadata: Metadata = {
  title: 'Tilago Overlay',
  description:
    'تركيبات بث بتتحرك مع كل هدية ومتابع. رابط واحد تحطه في OBS، بألوانك وشعارك، وتركيبات جديدة كل أسبوع.',
};

// نفس سياسة باقي الصفحات: مخزّنة على الحافة، ولوحة الأدمن بتلغي الكاش
// عند أي تعديل. الرقم ده شبكة أمان مش أكتر.
export const revalidate = 300;

export default async function OverlayPage() {
  let catalog: CatalogItem[] = [];
  try {
    const rows = await prisma.overlay.findMany({
      where: { active: true },
      orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true, slug: true, title: true, description: true,
        category: true, file: true, poster: true, isFree: true,
        featured: true, createdAt: true,
      },
    });
    catalog = rows.map(r => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      category: r.category as CatalogItem['category'],
      file: r.file,
      poster: r.poster,
      isFree: r.isFree,
      featured: r.featured,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch {
    // الداتابيز مش متاحة: الصفحة بتفضل تشتغل والكتالوج بيقول إنه بيتجهّز،
    // بدل ما الصفحة كلها تقع
  }

  return <OverlayClient catalog={catalog} />;
}

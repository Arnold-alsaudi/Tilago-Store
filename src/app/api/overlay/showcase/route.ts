import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { overlayQuery } from '@/lib/overlaySig';

/**
 * التركيبات اللي بتتعرض حيّة في الصفحة الرئيسية.
 *
 * بترجّع روابط معاينة موقّعة — الصفحة مش بتعرف تعمل التوقيع بنفسها
 * لأنها بتشتغل عند الزائر. وكل تركيبة جديدة تتضاف في الأدمن بتظهر
 * هنا لوحدها من غير ما نلمس كود.
 */

export const dynamic = 'force-dynamic';

const CAT_NAME: Record<string, string> = {
  SUPPORTERS: 'داعمين',
  CHALLENGES: 'تحديات',
  GOALS: 'أهداف',
  DECOR: 'تزيين',
};

export async function GET() {
  try {
    const rows = await prisma.overlay.findMany({
      where: { active: true },
      orderBy: [{ featured: 'desc' }, { sort: 'asc' }, { createdAt: 'desc' }],
      take: 5,
      select: { slug: true, title: true, category: true, featured: true },
    });

    const items = await Promise.all(
      rows.map(async r => ({
        slug: r.slug,
        name: r.title,
        tag: CAT_NAME[r.category] ?? 'تركيبة',
        featured: r.featured,
        src: `/pv/${r.slug}?${await overlayQuery(`/pv/${r.slug}`)}`,
      })),
    );

    // العدد الكامل مش المعروض — ده اللي بيتكتب في الأرقام
    const total = await prisma.overlay.count({ where: { active: true } });

    return NextResponse.json({ items, total }, { headers: { 'cache-control': 'no-store' } });
  } catch {
    // الداتابيز مش متاحة: الصفحة بترجع للصور الثابتة
    return NextResponse.json({ items: [], total: 0 });
  }
}

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OverlayApp from './OverlayApp';
import type { AppOverlay, AppSub } from './shared';
import { overlayQuery } from '@/lib/overlaySig';
import { SHOTS } from '@/generated/shots';

export const metadata: Metadata = {
  title: 'Tilago Overlay',
  description:
    'تركيبات بث لتيك توك لايف بتصميم عربي حصري. رابط واحد تحطه في OBS، بألوانك، والمكتبة بتكبر كل أسبوع.',
};

// الصفحة بتتغيّر حسب حالة اشتراك كل عميل، فمينفعش تتخزّن
export const dynamic = 'force-dynamic';

export default async function OverlayPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;
  const name = session?.user?.name ?? null;

  let overlays: AppOverlay[] = [];
  let sub: AppSub = null;

  try {
    const [rows, s] = await Promise.all([
      prisma.overlay.findMany({
        where: { active: true },
        orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true, slug: true, title: true, description: true, category: true,
          file: true, poster: true, isFree: true, featured: true, createdAt: true,
        },
      }),
      email
        ? prisma.subscription.findUnique({
            where: { userEmail: email },
            select: { plan: true, status: true, endsAt: true, token: true, theme: true },
          })
        : null,
    ]);

    // كل معاينة بتاخد توقيع خاص بيها — من غيره ملف التركيبة مابيتفتحش
    overlays = await Promise.all(rows.map(async r => ({
      id: r.id, slug: r.slug, title: r.title, description: r.description,
      category: r.category as AppOverlay['category'], file: r.file,
      // لو الأدمن ماحطّش صورة، بنستخدم لقطة التركيبة المولّدة
      poster: r.poster ?? (SHOTS.includes(r.slug) ? `/shots/${r.slug}.png` : null),
      isFree: r.isFree, featured: r.featured,
      createdAt: r.createdAt.toISOString(),
      sig: await overlayQuery(`/pv/${r.slug}`),
    })));

    if (s) {
      sub = {
        plan: s.plan, status: s.status,
        endsAt: s.endsAt?.toISOString() ?? null,
        token: s.token,
        theme: (s.theme as Record<string, string> | null) ?? null,
      };
    }
  } catch {
    // الداتابيز مش متاحة: الصفحة بتفتح وبتقول إن المكتبة بتتجهّز
  }

  // الكل بيدخل على نفس اللوحة — الزائر بيشوف المعاينة والخطط، والمشترك
  // بيلاقي روابطه في قسم التركيبات.
  return <OverlayApp name={name} email={email} sub={sub} overlays={overlays} />;
}

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardClient, { type DashOverlay, type DashSub } from './DashboardClient';

export const metadata: Metadata = {
  title: 'تركيباتي',
  robots: { index: false, follow: false },
};

// لوحة شخصية: بتتبني لكل عميل على حدة ومابتتخزّنش
export const dynamic = 'force-dynamic';

export default async function OverlayDashboardPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) redirect('/auth/signin?callbackUrl=/overlay/dashboard');

  let sub: DashSub = null;
  let overlays: DashOverlay[] = [];

  try {
    const [s, rows] = await Promise.all([
      prisma.subscription.findUnique({
        where: { userEmail: email },
        select: { plan: true, status: true, startsAt: true, endsAt: true, token: true, theme: true },
      }),
      prisma.overlay.findMany({
        where: { active: true },
        orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true, slug: true, title: true, description: true,
          category: true, file: true, poster: true, isFree: true, createdAt: true,
        },
      }),
    ]);

    if (s) {
      sub = {
        plan: s.plan,
        status: s.status,
        startsAt: s.startsAt?.toISOString() ?? null,
        endsAt: s.endsAt?.toISOString() ?? null,
        token: s.token,
        theme: (s.theme as Record<string, string> | null) ?? null,
      };
    }

    overlays = rows.map(r => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      category: r.category as DashOverlay['category'],
      file: r.file,
      poster: r.poster,
      isFree: r.isFree,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch {
    // الداتابيز مش متاحة: اللوحة بتفتح وبتقول إن فيه مشكلة مؤقتة
  }

  return (
    <DashboardClient
      name={session?.user?.name ?? null}
      email={email}
      sub={sub}
      overlays={overlays}
    />
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { isRequestAdmin } from '@/lib/requireAdmin';
import { prisma } from '@/lib/prisma';
import { DEFAULT_HOME_CONTENT, type HomeContent } from '@/lib/homeContent';

export async function POST(req: NextRequest) {
  if (!await isRequestAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  // ندمج مع الافتراضي ونحفظ فقط الحقول المعروفة
  const content: HomeContent = {
    heroImage: typeof body.heroImage === 'string' ? body.heroImage : DEFAULT_HOME_CONTENT.heroImage,
    featuresTitle: typeof body.featuresTitle === 'string' ? body.featuresTitle : DEFAULT_HOME_CONTENT.featuresTitle,
    featuresSubtitle: typeof body.featuresSubtitle === 'string' ? body.featuresSubtitle : DEFAULT_HOME_CONTENT.featuresSubtitle,
    features: Array.isArray(body.features) ? body.features : DEFAULT_HOME_CONTENT.features,
    stats: Array.isArray(body.stats) ? body.stats : DEFAULT_HOME_CONTENT.stats,
    gallery: Array.isArray(body.gallery) ? body.gallery : DEFAULT_HOME_CONTENT.gallery,
  };

  await prisma.siteSetting.upsert({
    where: { key: 'homeContent' },
    update: { value: JSON.stringify(content) },
    create: { key: 'homeContent', value: JSON.stringify(content) },
  });

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyOverlaySig } from '@/lib/overlaySig';
import { renderOverlay, OVERLAY_HEADERS, type OverlayConfig } from '@/lib/overlayServe';

/**
 * معاينة التركيبة في صفحة الأوفرلي: /pv/<slug>?<ألوان>&exp=&sig=
 *
 * نسخة العرض: بتشتغل بوضع demo وعليها علامة Tilago، ومحدش يقدر يفتحها
 * من غير توقيع بنعمله احنا في الصفحة. يعني مش مجرد رابط حد يجربه، ومش
 * حاجة تتحط في موقع تاني.
 */

export const dynamic = 'force-dynamic';

const PALETTE_KEYS = ['violet', 'grape', 'navy', 'deep', 'ink', 'c1', 'c2'];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const q = req.nextUrl.searchParams;

  const ok = await verifyOverlaySig(`/pv/${slug}`, q.get('exp'), q.get('sig'));
  if (!ok) return new NextResponse(null, { status: 404 });

  const overlay = await prisma.overlay.findFirst({
    where: { slug, active: true },
    select: { file: true },
  }).catch(() => null);

  if (!overlay) return new NextResponse(null, { status: 404 });

  const cfg: OverlayConfig = { demo: '1', mark: '1' };
  for (const k of PALETTE_KEYS) {
    const v = q.get(k);
    // بنقبل ألوان hex بس — أي حاجة تانية ممكن تتسرّب جوه ستايل الصفحة
    if (v && /^#[0-9a-fA-F]{3,8}$/.test(v)) cfg[k] = v;
  }

  const page = renderOverlay(overlay.file, cfg);
  if (!page) return new NextResponse(null, { status: 404 });

  return new NextResponse(page, { status: 200, headers: OVERLAY_HEADERS });
}

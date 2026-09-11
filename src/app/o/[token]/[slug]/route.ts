import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * الرابط اللي العميل بيحطه في OBS: /o/<token>/<slug>
 *
 * التوكن هو المفتاح — عشوائي ومربوط بالاشتراك، وبيتجدد لو اتسرّب فكل روابط
 * العميل تتغيّر مرة واحدة. الـslug بيحدد التركيبة.
 *
 * لما الاشتراك يخلص، مابنرجّعش خطأ. لو رجّعنا 404 هيظهر مربع أبيض مكسور على
 * بث العميل قدام جمهوره. بنرجّع تركيبة شفافة فيها سطر صغير ليه هو بس.
 */

export const dynamic = 'force-dynamic';

/** صفحة شفافة برسالة هادية — بتتقال للعميل من غير ما الجمهور يشوف حاجة وحشة */
function quietNotice(message: string) {
  const html = `<!doctype html><meta charset="utf-8"><title>Tilago</title>
<style>
  html,body{margin:0;height:100%;background:transparent;overflow:hidden;
    font-family:'Segoe UI',system-ui,sans-serif}
  .n{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);
     display:flex;align-items:center;gap:8px;
     background:rgba(12,5,22,.72);color:#e8e4f8;
     border:1px solid rgba(127,58,161,.4);border-radius:999px;
     padding:8px 16px;font-size:13px;letter-spacing:.2px;white-space:nowrap}
  .n i{width:7px;height:7px;border-radius:50%;background:#c98bff;flex:none}
</style>
<div class="n"><i></i>${message}</div>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string; slug: string }> },
) {
  const { token, slug } = await params;

  const overlay = await prisma.overlay.findFirst({
    where: { slug, active: true },
    select: { file: true, isFree: true },
  }).catch(() => null);

  if (!overlay) return quietNotice('التركيبة دي مش متاحة');

  // التركيبة المجانية بتشتغل من غير اشتراك أصلاً
  if (!overlay.isFree) {
    const sub = await prisma.subscription.findUnique({
      where: { token },
      select: { status: true, endsAt: true, theme: true },
    }).catch(() => null);

    if (!sub) return quietNotice('الرابط ده مش مفعّل — راجع حسابك على tilago');

    const expired =
      sub.status !== 'active' ||
      (sub.endsAt !== null && sub.endsAt.getTime() < Date.now());

    if (expired) return quietNotice('انتهى الاشتراك — جدّد من حسابك على tilago');

    return NextResponse.redirect(themedUrl(_req, overlay.file, sub.theme), 307);
  }

  // المجانية: نفس الملف، وبعلامة Tilago
  const sub = await prisma.subscription.findUnique({
    where: { token },
    select: { theme: true },
  }).catch(() => null);

  return NextResponse.redirect(themedUrl(_req, overlay.file, sub?.theme ?? null, true), 307);
}

/** بنحوّل ألوان العميل المحفوظة لباراميترات الرابط اللي التركيبة بتقراها */
function themedUrl(
  req: NextRequest,
  file: string,
  theme: unknown,
  watermark = false,
): URL {
  const url = new URL(file, req.nextUrl.origin);

  if (theme && typeof theme === 'object') {
    for (const [k, v] of Object.entries(theme as Record<string, unknown>)) {
      if (typeof v === 'string' && v) url.searchParams.set(k, v);
    }
  }
  // وضع العرض مقفول دايماً في رابط العميل — غير كده هتظهر أسامي وهمية
  // على بثه قدام جمهوره
  url.searchParams.set('demo', '0');
  if (watermark) url.searchParams.set('mark', '1');

  return url;
}

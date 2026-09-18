import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fingerprint } from '@/lib/overlayServe';

/**
 * تتبّع نسخة مسرّبة: /api/admin/overlay-trace?id=<البصمة>
 *
 * كل نسخة تركيبة بتتسلّم عليها بصمة قصيرة في تعليق جوه الصفحة
 * (`<!--t:xxxx-->`). لو لقينا تركيبتنا شغّالة على بث حد مش عميل، بناخد
 * البصمة دي ونعرف منها الاشتراك اللي النسخة طلعت منه.
 *
 * البصمة مشتقّة من المفتاح بالـHMAC، يعني مش بنخزّنها في أي مكان ومش
 * ممكن حد يرجع منها للمفتاح. بنقارن بإننا نحسبها لكل مشترك.
 *
 * الحماية من الميدلوير — كل /api/admin محتاج أدمن.
 */

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const id = (req.nextUrl.searchParams.get('id') ?? '').trim().toLowerCase();
  if (!/^[0-9a-f]{10}$/.test(id)) {
    return NextResponse.json({ error: 'البصمة لازم تكون 10 حروف hex' }, { status: 400 });
  }

  const subs = await prisma.subscription.findMany({
    select: { id: true, userEmail: true, token: true, status: true, endsAt: true },
  });

  for (const s of subs) {
    if (await fingerprint(s.token) === id) {
      return NextResponse.json({
        found: true,
        subscriptionId: s.id,
        userEmail: s.userEmail,
        status: s.status,
        endsAt: s.endsAt,
        hint: 'جدّد المفتاح من صفحة الاشتراك عشان كل روابطه القديمة تبطل',
      });
    }
  }

  return NextResponse.json({ found: false });
}

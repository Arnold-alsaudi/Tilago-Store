import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fingerprintAll } from '@/lib/overlayServe';

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
  // بنقبل أي صورة من صور البصمة التلاتة — التعليق، أو رقم النسخة،
  // أو متغيّر اللون. وبنشيل اللي حواليها لو حد نسخ السطر كله.
  const raw = (req.nextUrl.searchParams.get('id') ?? '').trim().toLowerCase();
  const id = (raw.match(/[0-9a-z]{7,12}/) ?? [''])[0];
  if (!id) {
    return NextResponse.json({ error: 'ابعت البصمة' }, { status: 400 });
  }

  const subs = await prisma.subscription.findMany({
    select: { id: true, userEmail: true, token: true, status: true, endsAt: true },
  });

  for (const s of subs) {
    if ((await fingerprintAll(s.token)).includes(id)) {
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

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// لون هيكس بس — أي حاجة تانية بترجع 400. القيم دي بتتحط في رابط التركيبة
// اللي بيتفتح في OBS، فمينفعش نقبل نص حر فيها.
const HEX = /^#[0-9a-fA-F]{3,8}$/;

const themeSchema = z.object({
  theme: z.record(z.string().max(40), z.string().regex(HEX)).refine(
    o => Object.keys(o).length <= 12,
    'عدد القيم كبير',
  ),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = themeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'قيم ألوان غير صالحة' }, { status: 400 });
  }

  try {
    // الرابط في OBS مابيتغيّرش — الألوان بس اللي بتتحدّث، فالعميل يقدر
    // يغيّرها من موبايله وهو لايف من غير ما يلمس OBS
    const updated = await prisma.subscription.update({
      where: { userEmail: email },
      data: { theme: parsed.data.theme },
      select: { theme: true },
    });
    return NextResponse.json({ success: true, theme: updated.theme });
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === 'P2025') {
      return NextResponse.json({ error: 'مفيش اشتراك على الحساب ده' }, { status: 404 });
    }
    throw err;
  }
}

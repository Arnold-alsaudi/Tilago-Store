import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isRequestAdmin } from '@/lib/requireAdmin';
import { prisma } from '@/lib/prisma';
import { newToken } from '@/lib/subscription';

const patchSchema = z.object({
  // active يوقف ويشغّل · expired بينهيه فوراً
  status: z.enum(['active', 'pending', 'expired']).optional(),
  // تعديل تاريخ النهاية بالإيد — لحالات استثنائية زي تعويض عميل
  endsAt: z.string().datetime().nullable().optional(),
  // توليد مفتاح جديد: بيلغي كل روابط العميل القديمة مرة واحدة
  regenerateToken: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!await isRequestAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.errors[0];
    return NextResponse.json(
      { error: `${issue.path.join('.') || 'body'}: ${issue.message}` },
      { status: 400 },
    );
  }

  const { status, endsAt, regenerateToken } = parsed.data;

  try {
    const sub = await prisma.subscription.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(endsAt !== undefined ? { endsAt: endsAt ? new Date(endsAt) : null } : {}),
        ...(regenerateToken ? { token: newToken() } : {}),
      },
    });
    return NextResponse.json(sub);
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === 'P2025') {
      return NextResponse.json({ error: 'الاشتراك مش موجود' }, { status: 404 });
    }
    throw err;
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!await isRequestAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await prisma.subscription.delete({ where: { id } });
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === 'P2025') {
      return NextResponse.json({ error: 'الاشتراك مش موجود' }, { status: 404 });
    }
    throw err;
  }
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { isRequestAdmin } from '@/lib/requireAdmin';
import { prisma } from '@/lib/prisma';

const CATEGORIES = ['SUPPORTERS', 'CHALLENGES', 'GOALS', 'DECOR'] as const;

const overlaySchema = z.object({
  title:       z.string().trim().min(1).max(120),
  // الـ slug بيدخل في الرابط، فبنشيل منه أي حاجة غير حروف وأرقام وشرطات
  slug:        z.string().trim().toLowerCase().min(1).max(60)
                 .regex(/^[a-z0-9-]+$/, 'حروف إنجليزية وأرقام وشرطات فقط'),
  description: z.string().trim().max(400).nullable().optional(),
  category:    z.enum(CATEGORIES),
  file:        z.string().trim().min(1).max(300),
  poster:      z.string().trim().max(500).nullable().optional(),
  isFree:      z.boolean().default(false),
  featured:    z.boolean().default(false),
  active:      z.boolean().default(true),
  sort:        z.number().int().min(0).max(9999).default(0),
});

export async function GET(req: NextRequest) {
  if (!await isRequestAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const items = await prisma.overlay.findMany({
    orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  if (!await isRequestAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = overlaySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.errors[0];
    return NextResponse.json(
      { error: `${issue.path.join('.') || 'body'}: ${issue.message}` },
      { status: 400 },
    );
  }

  try {
    const overlay = await prisma.overlay.create({ data: parsed.data });
    // الكتالوج في /overlay مخزّن على الحافة، فلازم يتلغي عشان الجديد يبان فوراً
    try { revalidatePath('/overlay'); } catch {}
    return NextResponse.json(overlay, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === 'P2002') {
      return NextResponse.json(
        { error: `الرابط "${parsed.data.slug}" مستخدم في تركيبة تانية` },
        { status: 409 },
      );
    }
    throw err;
  }
}

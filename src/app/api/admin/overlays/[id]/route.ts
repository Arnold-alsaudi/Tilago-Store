import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { isRequestAdmin } from '@/lib/requireAdmin';
import { prisma } from '@/lib/prisma';

const CATEGORIES = ['SUPPORTERS', 'CHALLENGES', 'GOALS', 'DECOR'] as const;

const patchSchema = z.object({
  title:       z.string().trim().min(1).max(120).optional(),
  slug:        z.string().trim().toLowerCase().min(1).max(60)
                 .regex(/^[a-z0-9-]+$/, 'حروف إنجليزية وأرقام وشرطات فقط').optional(),
  description: z.string().trim().max(400).nullable().optional(),
  category:    z.enum(CATEGORIES).optional(),
  file:        z.string().trim().min(1).max(300).optional(),
  poster:      z.string().trim().max(500).nullable().optional(),
  isFree:      z.boolean().optional(),
  featured:    z.boolean().optional(),
  active:      z.boolean().optional(),
  sort:        z.number().int().min(0).max(9999).optional(),
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

  try {
    const overlay = await prisma.overlay.update({ where: { id }, data: parsed.data });
    try { revalidatePath('/overlay'); } catch {}
    return NextResponse.json(overlay);
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'P2002') {
      return NextResponse.json(
        { error: `الرابط "${parsed.data.slug}" مستخدم في تركيبة تانية` },
        { status: 409 },
      );
    }
    if (code === 'P2025') {
      return NextResponse.json({ error: 'التركيبة مش موجودة' }, { status: 404 });
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
    await prisma.overlay.delete({ where: { id } });
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === 'P2025') {
      return NextResponse.json({ error: 'التركيبة مش موجودة' }, { status: 404 });
    }
    throw err;
  }

  try { revalidatePath('/overlay'); } catch {}
  return NextResponse.json({ success: true });
}

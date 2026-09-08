import { NextRequest, NextResponse } from 'next/server';
import { isRequestAdmin } from '@/lib/requireAdmin';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const patchSchema = z.object({
  title:       z.string().min(1).optional(),
  description: z.string().optional(),
  price:       z.number().min(0).optional(),
  category:    z.enum(['ALERTS','STREAM','PACKAGE','THREE_D','VIDEO']).optional(),
  subCategory: z.string().nullable().optional(),
  priceLabel:  z.string().nullable().optional(),
  imageUrl:    z.string().optional(),
  images:      z.array(z.string()).optional(),
  videos:      z.array(z.string()).optional(),
  videoUrl:    z.string().nullable().optional(),
  tags:        z.array(z.string()).optional(),
  rating:      z.number().min(0).max(5).optional(),
  ratingCount: z.number().int().min(0).optional(),
  featured:    z.boolean().optional(),
  active:      z.boolean().optional(),
});

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!await isRequestAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!await isRequestAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // safeParse بدل parse — عشان المدخلات الغلط ترجع 400 برسالة واضحة مش 500
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.errors[0];
    return NextResponse.json(
      { error: `${issue.path.join('.') || 'body'}: ${issue.message}` },
      { status: 400 },
    );
  }

  const product = await prisma.product.update({ where: { id }, data: parsed.data });
  return NextResponse.json(product);
}

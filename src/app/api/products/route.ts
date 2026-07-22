import { NextRequest, NextResponse } from 'next/server';
import { isRequestAdmin } from '@/lib/requireAdmin';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const products = await prisma.product.findMany({
    where: { ...(category ? { category: category as any } : {}), active: true },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json(products);
}

const productSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  category: z.enum(['ALERTS', 'STREAM', 'PACKAGE', 'THREE_D', 'VIDEO']),
  subCategory: z.string().optional().nullable(),
  imageUrl: z.string().default(''),
  images: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
  videoUrl: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  if (!await isRequestAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const data = productSchema.parse(body);
  const product = await prisma.product.create({ data });
  return NextResponse.json(product, { status: 201 });
}

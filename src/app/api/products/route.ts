import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
  price: z.number().positive(),
  category: z.enum(['ALERTS', 'STREAM', 'PACKAGE', 'THREE_D']),
  imageUrl: z.string().url(),
  videoUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const data = productSchema.parse(body);
  const product = await prisma.product.create({ data });
  return NextResponse.json(product, { status: 201 });
}

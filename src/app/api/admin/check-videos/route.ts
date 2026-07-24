import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const secret = new URL(req.url).searchParams.get('secret');
  if (secret !== process.env.ADMIN_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const products = await prisma.product.findMany({
    where: { videoUrl: { not: null } },
    select: { id: true, title: true, videoUrl: true },
  });

  return NextResponse.json(products);
}

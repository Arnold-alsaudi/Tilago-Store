import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isRequestAdmin } from '@/lib/requireAdmin';

export async function GET(req: NextRequest) {
  if (!await isRequestAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const products = await prisma.product.findMany({
    where: { videoUrl: { not: null } },
    select: { id: true, title: true, videoUrl: true },
  });

  return NextResponse.json(products);
}

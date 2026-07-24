import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isRequestAdmin } from '@/lib/requireAdmin';

const VIDEO_MAP: Record<string, string> = {
  '/video/alert.mp4': 'https://res.cloudinary.com/v6vo90hw/video/upload/v1784782938/tilago/alert.mp4',
  '/video/tilago.mp4': 'https://res.cloudinary.com/v6vo90hw/video/upload/v1784782950/tilago/tilago.mp4',
};

export async function GET(req: NextRequest) {
  return POST(req);
}

export async function POST(req: NextRequest) {
  if (!await isRequestAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const products = await prisma.product.findMany({ where: { videoUrl: { not: null } } });
  let updated = 0;

  for (const p of products) {
    const newUrl = VIDEO_MAP[p.videoUrl ?? ''];
    if (newUrl) {
      await prisma.product.update({ where: { id: p.id }, data: { videoUrl: newUrl } });
      updated++;
    }
  }

  return NextResponse.json({ updated, total: products.length });
}

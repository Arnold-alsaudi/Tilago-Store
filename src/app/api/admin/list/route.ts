import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isRequestAdmin } from '@/lib/requireAdmin';

export async function GET(req: NextRequest) {
  if (!await isRequestAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(payments);
}

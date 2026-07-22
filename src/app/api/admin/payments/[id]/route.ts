import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isRequestAdmin } from '@/lib/requireAdmin';

const VALID_STATUSES = ['pending', 'in_progress', 'delivered'];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isRequestAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { deliveryStatus } = await req.json();

  if (!VALID_STATUSES.includes(deliveryStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const payment = await prisma.payment.update({
    where: { id },
    data: { deliveryStatus },
  });

  return NextResponse.json(payment);
}

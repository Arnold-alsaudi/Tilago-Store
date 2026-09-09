import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isRequestAdmin } from '@/lib/requireAdmin';

const DELIVERY = ['pending', 'in_progress', 'delivered'];

// حالة الدفع. PayPal.me مالوش webhook يأكد الدفع، فالطلب بيتسجّل "pending"
// وبيفضل كده للأبد من غير الزرار ده — يعني إيراد حقيقي مش بيتحسب.
// التأكيد قرار الأدمن بعد ما يشوف الفلوس وصلت فعلاً.
const PAYMENT = ['success', 'pending', 'failed', 'refunded'];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isRequestAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { deliveryStatus, status } = body ?? {};

  const data: { deliveryStatus?: string; status?: string } = {};

  if (deliveryStatus !== undefined) {
    if (!DELIVERY.includes(deliveryStatus)) {
      return NextResponse.json({ error: 'حالة تسليم غير صالحة' }, { status: 400 });
    }
    data.deliveryStatus = deliveryStatus;
  }

  if (status !== undefined) {
    if (!PAYMENT.includes(status)) {
      return NextResponse.json({ error: 'حالة دفع غير صالحة' }, { status: 400 });
    }
    data.status = status;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'مفيش حاجة تتحدّث' }, { status: 400 });
  }

  try {
    const payment = await prisma.payment.update({ where: { id }, data });
    return NextResponse.json(payment);
  } catch {
    return NextResponse.json({ error: 'الطلب ده مش موجود' }, { status: 404 });
  }
}

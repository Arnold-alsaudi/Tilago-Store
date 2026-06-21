import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  // حماية — أدمن فقط
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    include: { user: true, items: true },
    orderBy: { createdAt: 'desc' },
  });

  const rows = orders.flatMap(order =>
    order.items.map(item => ({
      'رقم الطلب': order.id,
      'اسم العميل': order.user?.name ?? '',
      'إيميل العميل': order.user?.email ?? '',
      'المنتج': item.productId,
      'الكمية': item.quantity,
      'السعر': item.price,
      'الإجمالي': order.total,
      'طريقة الدفع': order.paymentMethod,
      'الحالة': order.status,
      'التاريخ': new Date(order.createdAt).toLocaleString('ar-EG'),
    }))
  );

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'الطلبات');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="tilago-orders-${Date.now()}.xlsx"`,
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isRequestAdmin } from '@/lib/requireAdmin';
import * as XLSX from 'xlsx';

// تصدير الطلبات لملف Excel.
//
// كان بيقرأ من جدول Order — وده مفيش أي كود بيكتب فيه (الدفع كله بيتسجّل في
// جدول Payment عبر webhook بايموب و/api/lead)، فالملف كان بيطلع فاضي دايماً.
export async function GET(req: NextRequest) {
  if (!await isRequestAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const DELIVERY_LABELS: Record<string, string> = {
    pending: 'قيد المراجعة',
    in_progress: 'جارٍ التنفيذ',
    delivered: 'تم التسليم',
  };

  const rows = payments.map(p => ({
    'رقم العملية': p.id,
    'اسم العميل': p.userName ?? '',
    'إيميل العميل': p.userEmail,
    'رقم العميل': p.userPhone ?? '',
    'المنتج': p.productName ?? '',
    'المبلغ': p.amount,
    'العملة': p.currency,
    'طريقة الدفع': p.method,
    'حالة الدفع': p.status,
    'حالة التسليم': DELIVERY_LABELS[p.deliveryStatus] ?? p.deliveryStatus,
    'التاريخ': new Date(p.createdAt).toLocaleString('ar-EG'),
  }));

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

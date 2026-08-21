import { NextRequest, NextResponse } from 'next/server';
import { isRequestAdmin } from '@/lib/requireAdmin';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/getClientIp';
import * as XLSX from 'xlsx';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  if (!await isRequestAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const ip = getClientIp(req);
  const { success } = await rateLimit(ip, 20, 60_000);
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { userEmail, userName, productName, amount, method, orderId } = await req.json();
  if (!userEmail || !amount || !method) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // حفظ في قاعدة البيانات
  await prisma.payment.create({
    data: {
      userEmail,
      amount,
      method,
      status: 'success',
      currency: 'EGP',
    },
  });

  // عمل Excel وبعته على الإيميل
  const rows = [{
    'اسم العميل': userName ?? '',
    'إيميل العميل': userEmail,
    'المنتج': productName ?? '',
    'المبلغ': amount,
    'طريقة الدفع': method,
    'التاريخ': new Date().toLocaleString('ar-EG'),
  }];

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'دفعة جديدة');
  const buf = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: 'mohammedhany01290@gmail.com',
    subject: `💰 دفعة جديدة — ${productName} — ${amount} EGP`,
    html: `
      <div style="font-family: Arial; direction: rtl; padding: 20px;">
        <h2 style="color: #7A00FF;">دفعة جديدة على Tilago</h2>
        <p><strong>العميل:</strong> ${userName ?? '-'}</p>
        <p><strong>الإيميل:</strong> ${userEmail}</p>
        <p><strong>المنتج:</strong> ${productName ?? '-'}</p>
        <p><strong>المبلغ:</strong> ${amount} EGP</p>
        <p><strong>الطريقة:</strong> ${method}</p>
        <p><strong>التاريخ:</strong> ${new Date().toLocaleString('ar-EG')}</p>
      </div>
    `,
    attachments: [{
      filename: `payment-${Date.now()}.xlsx`,
      content: buf,
    }],
  });

  return NextResponse.json({ success: true });
}

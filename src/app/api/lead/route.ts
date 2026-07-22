import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { prisma } from '@/lib/prisma';

// تسجيل طلب PayPal كـ "قيد الانتظار" مع رقم العميل — عشان الأدمن يتابعه ويتواصل
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await rateLimit(ip, 10, 60_000);
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { name, amount, phone, method } = await req.json();
  const customerPhone = String(phone ?? '').trim();
  if (!name || !amount || customerPhone.replace(/\D/g, '').length < 8) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    await prisma.payment.create({
      data: {
        userEmail: 'paypal@tilago.io',
        userName: 'عميل PayPal',
        userPhone: customerPhone,
        productName: String(name).slice(0, 200),
        amount: Number(amount),
        currency: 'EGP',
        method: String(method ?? 'PayPal'),
        status: 'pending', // مش مؤكد — الأدمن يتأكد من وصول الفلوس على PayPal
        deliveryStatus: 'pending',
      },
    });
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

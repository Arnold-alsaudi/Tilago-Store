import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/getClientIp';
import { secureHash } from '@/lib/crypto';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimit(ip, 10, 60_000);
  if (!success) return NextResponse.json({ error: 'محاولات كثيرة، انتظر قليلاً' }, { status: 429 });

  const { email, code } = await req.json();
  if (!email || !code) {
    return NextResponse.json({ error: 'البريد والكود مطلوبان' }, { status: 400 });
  }

  const record = await prisma.emailVerification.findFirst({
    where: { email },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    return NextResponse.json({ error: 'لا يوجد كود، أعد الطلب' }, { status: 404 });
  }

  if (new Date() > record.expiresAt) {
    await prisma.emailVerification.deleteMany({ where: { email } });
    return NextResponse.json({ error: 'انتهت صلاحية الكود، أعد الطلب' }, { status: 410 });
  }

  // حماية من التخمين — 5 محاولات كحد أقصى
  if (record.attempts >= 5) {
    await prisma.emailVerification.deleteMany({ where: { email } });
    return NextResponse.json({ error: 'محاولات كثيرة خاطئة، أعد طلب كود جديد' }, { status: 429 });
  }

  if (secureHash(code) !== record.codeHash) {
    await prisma.emailVerification.update({
      where: { id: record.id },
      data: { attempts: record.attempts + 1 },
    });
    return NextResponse.json({ error: 'الكود غير صحيح' }, { status: 400 });
  }

  // تأكد إن الإيميل لسه مش مسجّل (سباق محتمل)
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.emailVerification.deleteMany({ where: { email } });
    return NextResponse.json({ error: 'هذا البريد مسجّل بالفعل' }, { status: 409 });
  }

  // أنشئ الحساب (الباسورد متخزّن مشفّر بالفعل)
  await prisma.user.create({
    data: {
      email: record.email,
      name: record.name,
      password: record.password,
      emailVerified: new Date(),
    },
  });

  await prisma.emailVerification.deleteMany({ where: { email } });

  return NextResponse.json({ success: true });
}

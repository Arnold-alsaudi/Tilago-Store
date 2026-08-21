import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/getClientIp';
import { secureHash } from '@/lib/crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimit(ip, 5, 60_000);
  if (!success) return NextResponse.json({ error: 'محاولات كثيرة، انتظر قليلاً' }, { status: 429 });

  const { name, email, password } = await req.json();
  if (!email || !password || !name) {
    return NextResponse.json({ error: 'كل الحقول مطلوبة' }, { status: 400 });
  }

  // تحقق من صيغة الإيميل
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'صيغة البريد الإلكتروني غير صحيحة' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'كلمة المرور 8 أحرف على الأقل' }, { status: 400 });
  }

  // هل الإيميل مستخدم بالفعل؟
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'هذا البريد مسجّل بالفعل' }, { status: 409 });
  }

  // توليد كود 6 أرقام
  const code = crypto.randomInt(100000, 1000000).toString();
  const codeHash = secureHash(code);
  const passwordHash = await bcrypt.hash(password, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 دقائق

  // امسح أي أكواد قديمة لنفس الإيميل ثم خزّن الجديد
  await prisma.emailVerification.deleteMany({ where: { email } });
  await prisma.emailVerification.create({
    data: { email, codeHash, name, password: passwordHash, expiresAt },
  });

  // ابعت الكود بالإيميل
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `كود التحقق من Tilago: ${code}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #0F083B; border-radius: 16px; text-align: center;">
          <h2 style="color: #9B59D0; margin-bottom: 8px;">مرحباً بك في Tilago</h2>
          <p style="color: #b0a0d0; font-size: 14px; margin-bottom: 24px;">استخدم الكود التالي لتفعيل حسابك:</p>
          <div style="background: #5416B5; color: #fff; font-size: 34px; font-weight: bold; letter-spacing: 10px; padding: 18px; border-radius: 12px; margin-bottom: 20px;">
            ${code}
          </div>
          <p style="color: #8070a0; font-size: 12px;">الكود صالح لمدة 10 دقائق. إذا لم تطلب هذا الكود تجاهل الرسالة.</p>
        </div>
      `,
    });
  } catch {
    return NextResponse.json({ error: 'تعذر إرسال الكود، حاول لاحقاً' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

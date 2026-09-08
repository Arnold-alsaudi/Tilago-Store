import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/getClientIp';
import { sendMail, escapeHtml as esc, NOTIFY_EMAILS } from '@/lib/mailer';
import { z } from 'zod';

const contactSchema = z.object({
  name:    z.string().min(2).max(100),
  email:   z.string().email(),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimit(ip, 5, 60_000);
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const { name, email, subject, message } = parsed.data;

  // الموضوع نص عادي (مش HTML) — الهروب هنا كان بيحط &amp; وغيره في عنوان الرسالة
  const mail = await sendMail({
    to: NOTIFY_EMAILS,
    subject: subject ? `رسالة من ${name}: ${subject}` : `رسالة جديدة من ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; direction: rtl; padding: 20px;">
        <h2 style="color: #7A00FF;">رسالة جديدة من موقع Tilago</h2>
        <p><strong>الاسم:</strong> ${esc(name)}</p>
        <p><strong>الإيميل:</strong> ${esc(email)}</p>
        <p><strong>الموضوع:</strong> ${esc(subject ?? '-')}</p>
        <hr style="border-color: #7A00FF;" />
        <p><strong>الرسالة:</strong></p>
        <p>${esc(message).replace(/\n/g, '<br/>')}</p>
      </div>
    `,
  });

  // Resend بيرجع الخطأ في الـ response مش كـ exception — لازم نفحصه بنفسنا
  if (!mail.ok) return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });

  return NextResponse.json({ success: true });
}

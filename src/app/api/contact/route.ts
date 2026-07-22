import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { rateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  name:    z.string().min(2).max(100),
  email:   z.string().email(),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(2000),
});

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await rateLimit(ip, 5, 60_000);
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const body = await req.json();
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const { name, email, subject, message } = parsed.data;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: 'mohammedhany01290@gmail.com',
      subject: subject ? `رسالة من ${esc(name)}: ${esc(subject)}` : `رسالة جديدة من ${esc(name)}`,
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

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

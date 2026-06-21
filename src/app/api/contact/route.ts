import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: 'mohammedhany01290@gmail.com',
      subject: subject || `رسالة جديدة من ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; padding: 20px;">
          <h2 style="color: #7A00FF;">رسالة جديدة من موقع Tilago</h2>
          <p><strong>الاسم:</strong> ${name}</p>
          <p><strong>الإيميل:</strong> ${email}</p>
          <p><strong>الموضوع:</strong> ${subject || '-'}</p>
          <hr style="border-color: #7A00FF;" />
          <p><strong>الرسالة:</strong></p>
          <p>${message.replace(/\n/g, '<br/>')}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

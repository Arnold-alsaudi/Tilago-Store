import { Resend } from 'resend';

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export interface PaymentNotification {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productName: string;
  amount: number;
  currency: string;
  referenceId: string;
  paymentMethod: string;
  paidAt: string;
}

// ─── Telegram ───────────────────────────────────────────────
export async function sendTelegram(data: PaymentNotification) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const msg = [
    '💰 *دفعة جديدة على Tilago*',
    '',
    `👤 *الاسم:* ${data.customerName}`,
    `📧 *الإيميل:* ${data.customerEmail}`,
    `📱 *رقم التواصل:* ${data.customerPhone || 'غير متوفر'}`,
    `🎨 *المنتج:* ${data.productName}`,
    `💵 *المبلغ:* ${data.amount} ${data.currency}`,
    `💳 *طريقة الدفع:* ${data.paymentMethod}`,
    `🔖 *الرقم المرجعي:* \`${data.referenceId}\``,
    `🕐 *وقت الدفع:* ${data.paidAt}`,
    '',
    '✅ *الدفع مؤكد — يرجى التسليم خلال 24 ساعة*',
  ].join('\n');

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: msg,
      parse_mode: 'Markdown',
    }),
  });
}

// ─── WhatsApp عبر CallMeBot (مجاني) ─────────────────────────
export async function sendWhatsApp(data: PaymentNotification) {
  const phone = process.env.WHATSAPP_PHONE;
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (!phone || !apiKey) return;

  const msg = [
    '💰 دفعة جديدة على Tilago',
    `👤 الاسم: ${data.customerName}`,
    `📧 الإيميل: ${data.customerEmail}`,
    `📱 رقم التواصل: ${data.customerPhone || 'غير متوفر'}`,
    `🎨 المنتج: ${data.productName}`,
    `💵 المبلغ: ${data.amount} ${data.currency}`,
    `💳 طريقة الدفع: ${data.paymentMethod}`,
    `🔖 الرقم المرجعي: ${data.referenceId}`,
    `🕐 وقت الدفع: ${data.paidAt}`,
    '✅ الدفع مؤكد — يرجى التسليم خلال 24 ساعة',
  ].join('\n');

  const encoded = encodeURIComponent(msg);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apiKey}`;

  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log('[WhatsApp] Status:', res.status, '| Response:', text.slice(0, 200));
  } catch (e: unknown) {
    const msg2 = e instanceof Error ? e.message : String(e);
    console.error('[WhatsApp] Fetch error:', msg2);
  }
}

// ─── Email عبر Resend ────────────────────────────────────────
export async function sendEmailNotification(data: PaymentNotification) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: 'mohammedhany01290@gmail.com',
    subject: `💰 دفعة جديدة — ${data.productName} — ${data.amount} ${data.currency}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 8px;">💰 دفعة جديدة على Tilago</h2>

        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr style="background: #f9fafb;">
            <td style="padding: 10px 14px; font-weight: bold; color: #374151; width: 40%;">👤 اسم العميل</td>
            <td style="padding: 10px 14px; color: #111827;">${esc(data.customerName)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: bold; color: #374151;">📧 البريد الإلكتروني</td>
            <td style="padding: 10px 14px; color: #111827;">${esc(data.customerEmail)}</td>
          </tr>
          <tr style="background: #f9fafb;">
            <td style="padding: 10px 14px; font-weight: bold; color: #374151;">📱 رقم التواصل</td>
            <td style="padding: 10px 14px; color: #111827; font-weight: bold;">${esc(data.customerPhone || 'غير متوفر')}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: bold; color: #374151;">🎨 المنتج</td>
            <td style="padding: 10px 14px; color: #111827;">${esc(data.productName)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: bold; color: #374151;">💵 المبلغ المدفوع</td>
            <td style="padding: 10px 14px; color: #16a34a; font-weight: bold; font-size: 18px;">${esc(String(data.amount))} ${esc(data.currency)}</td>
          </tr>
          <tr style="background: #f9fafb;">
            <td style="padding: 10px 14px; font-weight: bold; color: #374151;">💳 طريقة الدفع</td>
            <td style="padding: 10px 14px; color: #111827;">${esc(data.paymentMethod)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: bold; color: #374151;">🔖 الرقم المرجعي</td>
            <td style="padding: 10px 14px; color: #7c3aed; font-family: monospace; font-size: 14px;">${esc(data.referenceId)}</td>
          </tr>
          <tr style="background: #f9fafb;">
            <td style="padding: 10px 14px; font-weight: bold; color: #374151;">🕐 وقت الدفع</td>
            <td style="padding: 10px 14px; color: #111827;">${esc(data.paidAt)}</td>
          </tr>
        </table>

        <div style="margin-top: 24px; padding: 16px; background: #ecfdf5; border-radius: 8px; border-right: 4px solid #16a34a;">
          <p style="margin: 0; color: #15803d; font-weight: bold; font-size: 16px;">
            ✅ الدفع مؤكد — يرجى تسليم المنتج للعميل خلال 24 ساعة
          </p>
        </div>

        <p style="margin-top: 20px; color: #6b7280; font-size: 12px; text-align: center;">
          Tilago Store — نظام إشعارات الدفع
        </p>
      </div>
    `,
  });
}

// ─── إرسال الكل دفعة واحدة ──────────────────────────────────
export async function notifyAllChannels(data: PaymentNotification) {
  await Promise.allSettled([
    sendTelegram(data),
    sendWhatsApp(data),
    sendEmailNotification(data),
  ]);
}

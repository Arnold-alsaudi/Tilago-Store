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

  // parse_mode: 'HTML' مع هروب كل القيم الجاية من العميل (الاسم/المنتج...) —
  // Markdown القديم مكانش بيهرب، فاسم مصمّم بذكاء كان يقدر يزوّر شكل الرسالة أو يحقن رابط
  const msg = [
    '💰 <b>دفعة جديدة على Tilago</b>',
    '',
    `👤 <b>الاسم:</b> ${esc(data.customerName)}`,
    `📧 <b>الإيميل:</b> ${esc(data.customerEmail)}`,
    `📱 <b>رقم العميل:</b> ${esc(data.customerPhone || 'غير متوفر')}`,
    `🎨 <b>المنتج:</b> ${esc(data.productName)}`,
    `💵 <b>المبلغ:</b> ${esc(String(data.amount))} ${esc(data.currency)}`,
    `💳 <b>طريقة الدفع:</b> ${esc(data.paymentMethod)}`,
    `🔖 <b>الرقم المرجعي:</b> <code>${esc(data.referenceId)}</code>`,
    `🕐 <b>وقت الدفع:</b> ${esc(data.paidAt)}`,
    '',
    '✅ <b>الدفع مؤكد — يرجى التسليم خلال 24 ساعة</b>',
  ].join('\n');

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: msg,
      parse_mode: 'HTML',
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
            <td style="padding: 10px 14px; font-weight: bold; color: #374151;">📱 رقم العميل</td>
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

// ─── إشعار طلب مع تخصيص (شعار + رقم تواصل) عند الشراء ─────────
export interface CustomOrderNotification {
  productName: string;
  quantity: number;
  amount: number;
  currency: string;
  name: string;
  contact: string;
  logoUrl: string;
}

export async function notifyCustomOrder(d: CustomOrderNotification) {
  const at = new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' });
  const jobs: Promise<unknown>[] = [];

  // Telegram (HTML مع هروب كامل + معاينة رابط الشعار)
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (token && chatId) {
    const msg = [
      '🎨 <b>طلب مع تخصيص</b>',
      '',
      `🎯 <b>المنتج:</b> ${esc(d.productName)} × ${d.quantity}`,
      `💵 <b>المبلغ:</b> ${esc(String(d.amount))} ${esc(d.currency)}`,
      d.name ? `✍️ <b>الاسم/الشعار المكتوب:</b> ${esc(d.name)}` : '',
      d.logoUrl ? `🖼️ <b>الشعار:</b> ${esc(d.logoUrl)}` : '',
      `📱 <b>وسيلة التواصل:</b> ${esc(d.contact)}`,
      `🕐 <b>الوقت:</b> ${esc(at)}`,
      '',
      '⏳ <i>بانتظار تأكيد الدفع</i>',
    ].filter(Boolean).join('\n');
    jobs.push(fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' }),
    }));
  }

  // Email (فيه معاينة صورة الشعار)
  jobs.push(resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: 'mohammedhany01290@gmail.com',
    subject: `🎨 طلب مع تخصيص — ${d.productName}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 8px;">🎨 طلب مع تخصيص</h2>
        <p><strong>المنتج:</strong> ${esc(d.productName)} × ${d.quantity}</p>
        <p><strong>المبلغ:</strong> ${esc(String(d.amount))} ${esc(d.currency)}</p>
        ${d.name ? `<p><strong>الاسم/الشعار المكتوب:</strong> ${esc(d.name)}</p>` : ''}
        <p><strong>وسيلة التواصل:</strong> <span style="color:#16a34a;font-weight:bold;">${esc(d.contact)}</span></p>
        ${d.logoUrl ? `<p><strong>الشعار:</strong> <a href="${esc(d.logoUrl)}">${esc(d.logoUrl)}</a></p>
          <p><img src="${esc(d.logoUrl)}" alt="logo" style="max-width:260px;border-radius:10px;border:1px solid #ddd;"/></p>` : ''}
        <p style="color:#6b7280;font-size:12px;">${esc(at)} — بانتظار تأكيد الدفع</p>
      </div>
    `,
  }).catch(() => {}));

  await Promise.allSettled(jobs);
}

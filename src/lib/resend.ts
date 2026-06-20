import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder');

export async function sendOrderConfirmation(
  email: string,
  name: string,
  orderId: string,
  total: number,
  items: { title: string; price: number }[]
) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@tilago.io',
    to: email,
    subject: `Order Confirmed — Tilago #${orderId.slice(0, 8).toUpperCase()}`,
    html: `
      <div style="background:#0C0516;color:#F0E6FF;font-family:Inter,sans-serif;padding:40px;max-width:600px;margin:0 auto;border-radius:16px;border:1px solid rgba(127,58,161,0.35)">
        <h1 style="font-family:sans-serif;background:linear-gradient(90deg,#7F3AA1,#F0830B);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:28px;margin-bottom:8px">Tilago</h1>
        <h2 style="color:#F0E6FF;margin-bottom:24px">Order Confirmed!</h2>
        <p style="color:#9B8FC0;margin-bottom:24px">Hi ${name}, your order has been confirmed.</p>
        <div style="background:rgba(84,22,181,0.08);border:1px solid rgba(127,58,161,0.35);border-radius:12px;padding:20px;margin-bottom:24px">
          ${items.map(i => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(127,58,161,0.2)"><span>${i.title}</span><span style="color:#F0830B">$${i.price.toFixed(2)}</span></div>`).join('')}
          <div style="display:flex;justify-content:space-between;padding-top:12px;font-weight:bold"><span>Total</span><span style="color:#F0830B">$${total.toFixed(2)}</span></div>
        </div>
        <p style="color:#9B8FC0;font-size:14px">Order ID: ${orderId}</p>
        <p style="color:#9B8FC0;font-size:12px;margin-top:24px">Thank you for choosing Tilago — Professional Video Editing & Motion Graphics</p>
      </div>
    `,
  });
}

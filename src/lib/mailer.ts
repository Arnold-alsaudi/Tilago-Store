import { Resend } from 'resend';

// ── مُرسل موحّد لكل إيميلات الموقع ────────────────────────────
//
// مهم: `resend.emails.send()` **مابيرميش استثناء** لما الـ API يرفض الطلب —
// بيرجع `{ data: null, error }`. فالـ try/catch لوحده مابيمسكش الأخطاء دي،
// وده اللي كان بيخلّي الفشل يعدّي بصمت والموقع يقول "تم الإرسال".
// كل الإرسال بقى يعدّي من هنا عشان أي فشل يتسجّل ويرجع للمستدعي.

const apiKey = process.env.RESEND_API_KEY;
const resend = new Resend(apiKey || 'missing-api-key');

export const MAIL_FROM = (process.env.RESEND_FROM_EMAIL ?? '').trim();

// الإيميلات اللي تستقبل الرسائل والطلبات والإشعارات (في كل الصفحات).
// تتظبط من NOTIFY_EMAILS في env — إيميلات مفصولة بفواصل.
export const NOTIFY_EMAILS = (process.env.NOTIFY_EMAILS ?? 'mohamed8abdalhamed@gmail.com')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// حساب Resend في الوضع التجريبي (المُرسل onboarding@resend.dev) بيسمح بالإرسال
// **فقط** لإيميل صاحب الحساب — أي إيميل تاني بيترفض بـ 403. يعني أكواد التحقق
// وإشعارات الدفع مش هتوصل. الحل: تفعيل دومين في resend.com/domains ثم ضبط
// RESEND_FROM_EMAIL على عنوان من الدومين ده.
export const IS_SANDBOX_SENDER = /@resend\.dev$/i.test(MAIL_FROM);

if (IS_SANDBOX_SENDER) {
  console.warn(
    '[Mail] RESEND_FROM_EMAIL = "%s" — ده مُرسل Resend التجريبي، وبيسمح بالإرسال ' +
    'لإيميل صاحب الحساب بس. أكواد التحقق وإشعارات الدفع لأي إيميل تاني هتترفض. ' +
    'فعّل دومين في resend.com/domains وغيّر RESEND_FROM_EMAIL.',
    MAIL_FROM,
  );
}

export interface MailAttachment {
  filename: string;
  content: string | Buffer;
}

export interface MailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: MailAttachment[];
}

export interface MailResult {
  ok: boolean;
  error?: string;
}

export async function sendMail({ to, subject, html, attachments }: MailOptions): Promise<MailResult> {
  if (!apiKey) {
    const error = 'RESEND_API_KEY غير مضبوط';
    console.error('[Mail] %s — تخطّينا إرسال "%s"', error, subject);
    return { ok: false, error };
  }
  if (!MAIL_FROM) {
    const error = 'RESEND_FROM_EMAIL غير مضبوط';
    console.error('[Mail] %s — تخطّينا إرسال "%s"', error, subject);
    return { ok: false, error };
  }

  try {
    const { error } = await resend.emails.send({
      from: MAIL_FROM,
      to,
      subject,
      html,
      ...(attachments?.length ? { attachments } : {}),
    });
    if (error) {
      console.error('[Mail] فشل إرسال "%s" إلى %s: %s', subject, String(to), error.message ?? String(error));
      return { ok: false, error: error.message ?? 'فشل الإرسال' };
    }
    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[Mail] خطأ شبكة أثناء إرسال "%s": %s', subject, msg);
    return { ok: false, error: msg };
  }
}

// هروب HTML لأي قيمة جاية من العميل قبل ما تتحط في قالب الإيميل
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

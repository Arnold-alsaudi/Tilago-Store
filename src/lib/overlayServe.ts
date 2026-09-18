/**
 * تسليم التركيبات.
 *
 * الملفات مش موجودة على الموقع كعناوين — بتتبني وقت البناء جوه وحدة كود
 * (src/generated/overlays.ts) والسيرفر هو اللي بيسلّمها. يعني مفيش مسار
 * حد يخمّنه، ومفيش ملف ساكن حد يفتحه.
 *
 * وكل نسخة بتتسلّم فيها حاجتين:
 *   • الإعدادات (ألوان العميل، النصوص، وضع العرض) محقونة في الصفحة بدل
 *     ما تبقى مكشوفة في الرابط.
 *   • بصمة قصيرة مربوطة بالمشترك. لو لقينا تركيبتنا على بث حد تاني،
 *     بنعرف النسخة دي طلعت منين.
 *
 * البصمة مش حماية ضد حد محترف — دي بتخلّي التسريب له صاحب معروف.
 */
import { OVERLAY_HTML } from '@/generated/overlays';

const ENC = new TextEncoder();

function secret(): string {
  const s = process.env.OVERLAY_SIG_SECRET || process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error('OVERLAY_SIG_SECRET مش موجود');
  return s;
}

/**
 * بصمة المشترك — مشتقّة من مفتاحه، فمش محتاجين نخزّن حاجة زيادة،
 * وفي نفس الوقت مابتكشفش المفتاح نفسه لو حد شافها.
 */
export async function fingerprint(token: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', ENC.encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, ENC.encode('fp|' + token));
  return Array.from(new Uint8Array(mac).slice(0, 5))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** بنقبل المسار الكامل اللي متخزّن في الداتابيز أو اسم الملف لوحده */
function basename(file: string): string {
  return file.split('/').pop() ?? file;
}

export type OverlayConfig = Record<string, string | number>;

/**
 * بترجّع صفحة التركيبة جاهزة للتسليم.
 * الإعدادات بتتحقن قبل أي كود في الصفحة، فالتركيبة بتلاقيها مستنياها.
 */
export function renderOverlay(
  file: string,
  config: OverlayConfig,
  mark?: string,
): string | null {
  const html = OVERLAY_HTML[basename(file)];
  if (!html) return null;

  // JSON.stringify بيهرب علامات الاقتباس، وبنقفل </script> عشان أي نص
  // جاي من العميل (اسم فريق مثلاً) مايقدرش يخرج بره الوسم
  const json = JSON.stringify(config).replace(/<\//g, '<\\/');
  const inject = `<script>window.__T=${json}</script>`;
  const stamp = mark ? `<!--t:${mark}-->` : '';

  return html.replace('</title>', '</title>' + stamp + inject);
}

/** الترويسات اللي بتخلّي النسخة ماتفضلش متخزّنة في أي مكان في الطريق */
export const OVERLAY_HEADERS = {
  'content-type': 'text/html; charset=utf-8',
  'cache-control': 'no-store, no-cache, must-revalidate',
  'x-robots-tag': 'noindex, nofollow',
} as const;

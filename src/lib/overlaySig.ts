/**
 * توقيع روابط التركيبات.
 *
 * ملفات التركيبات بتتسلّم للمتصفح في الآخر، فمفيش حاجة هتمنع حد معاه
 * رابط شغّال إنه ياخد نسخة. اللي بنمنعه هنا حاجة تانية: إن أي زائر
 * يفتح /overlays/x.html على طول وياخد الملف من غير ما يكون عميل ولا
 * حتى فتح الصفحة.
 *
 * كل رابط بيتسلّم من عندنا بيتمضى، والتوقيع بيقع بعد دقايق. المصدر في
 * OBS بيعدّي على /o/<token>/<slug> في كل مرة بيحمّل، فبياخد توقيع
 * جديد لوحده — العميل مش هيحس بحاجة.
 *
 * بنستخدم Web Crypto عشان الكود ده بيشتغل في الميدلوير (edge) وفي
 * الراوتس العادية بنفس الشكل.
 */

const ENC = new TextEncoder();

/** صلاحية التوقيع — كفاية جداً لتحميل صفحة، وقصيرة على أي حد بينسخ روابط */
export const SIG_TTL_MS = 10 * 60 * 1000;

function secret(): string {
  const s = process.env.OVERLAY_SIG_SECRET || process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error('OVERLAY_SIG_SECRET مش موجود');
  return s;
}

let keyPromise: Promise<CryptoKey> | null = null;

function hmacKey(): Promise<CryptoKey> {
  keyPromise ??= crypto.subtle.importKey(
    'raw',
    ENC.encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return keyPromise;
}

const toB64Url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

/** التوقيع على المسار والوقت بس — الباراميترات (الألوان والنصوص) حرّة تتغيّر */
async function digest(pathname: string, exp: number): Promise<string> {
  const mac = await crypto.subtle.sign('HMAC', await hmacKey(), ENC.encode(`${pathname}|${exp}`));
  return toB64Url(mac).slice(0, 27);
}

/** بترجّع `exp` و`sig` عشان يتحطوا على رابط الملف */
export async function signOverlayPath(pathname: string): Promise<{ exp: string; sig: string }> {
  const exp = Date.now() + SIG_TTL_MS;
  return { exp: String(exp), sig: await digest(pathname, exp) };
}

/** نفس الحاجة بس جاهزة كـquery string */
export async function overlayQuery(pathname: string): Promise<string> {
  const { exp, sig } = await signOverlayPath(pathname);
  return `exp=${exp}&sig=${sig}`;
}

export async function verifyOverlaySig(
  pathname: string,
  exp: string | null,
  sig: string | null,
): Promise<boolean> {
  if (!exp || !sig) return false;

  const ms = Number(exp);
  if (!Number.isFinite(ms) || ms < Date.now()) return false;

  const expected = await digest(pathname, ms);

  // مقارنة بوقت ثابت — مقارنة عادية بتسرّب معلومة عن التوقيع الصح
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

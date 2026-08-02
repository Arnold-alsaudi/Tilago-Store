import { Redis } from '@upstash/redis';

// ── Fallback داخلي (للتطوير أو لو Upstash غير مُعدّ) ──────────
const memoryMap = new Map<string, { count: number; resetTime: number }>();

function memoryLimit(ip: string, limit: number, windowMs: number): { success: boolean } {
  const now = Date.now();
  const entry = memoryMap.get(ip);

  if (!entry || now > entry.resetTime) {
    memoryMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }
  if (entry.count >= limit) return { success: false };
  entry.count++;
  return { success: true };
}

// ── Upstash Redis — يعمل عبر كل الـ instances على serverless ──
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// new Redis() بيتحقق من شكل الـ URL فوراً ولو غلط بيرمي خطأ وقت تحميل الملف —
// ده ممكن يكسر الـ build كله، فلازم نلفه بـ try/catch بدل ما نثق إن القيمة سليمة
let redis: Redis | null = null;
if (url && token) {
  try {
    redis = new Redis({ url, token });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Security] UPSTASH_REDIS_REST_URL/TOKEN غير صحيحين، هنرجع للذاكرة المحلية:', msg);
  }
}

if (!redis) {
  // بدون Redis، الـ rate limit بيشتغل بذاكرة كل instance لوحدها —
  // على Vercel (serverless) كل استدعاء ممكن ياخد instance جديدة، يعني الحد فعلياً غير موثوق
  console.warn(
    '[Security] UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN غير مُعدّين أو غير صحيحين — ' +
    'rate limiting هيشتغل بذاكرة محلية غير موزّعة، ومش فعّال على serverless (Vercel). ' +
    'أنشئ قاعدة Upstash Redis وحط الـ credentials في env vars.'
  );
}

// عدّاد بنافذة ثابتة عبر Redis (يدعم limit/window ديناميكيين)
export async function rateLimit(
  ip: string,
  limit = 10,
  windowMs = 60_000,
): Promise<{ success: boolean }> {
  if (!redis) return memoryLimit(ip, limit, windowMs);

  const key = `rl:${ip}:${limit}:${windowMs}`;
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.pexpire(key, windowMs);
    return { success: count <= limit };
  } catch (err) {
    // لو Redis وقع لأي سبب — نرجع للذاكرة بدل ما نكسر الطلب، لكن لازم الخطأ يبقى ظاهر
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Security] Upstash Redis call failed, falling back to in-memory rate limit:', msg);
    return memoryLimit(ip, limit, windowMs);
  }
}

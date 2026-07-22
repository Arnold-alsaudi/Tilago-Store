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
const redis = url && token ? new Redis({ url, token }) : null;

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
  } catch {
    // لو Redis وقع لأي سبب — نرجع للذاكرة بدل ما نكسر الطلب
    return memoryLimit(ip, limit, windowMs);
  }
}

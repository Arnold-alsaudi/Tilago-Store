// Web Crypto API — يعمل في Edge Runtime و Node.js على حد سواء

const SECRET = process.env.ADMIN_SECRET!;
const TOKEN_TTL = 4 * 60 * 60 * 1000; // 4 ساعات

async function hmacSha256(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const aB = new TextEncoder().encode(a);
  const bB = new TextEncoder().encode(b);
  let diff = 0;
  for (let i = 0; i < aB.length; i++) diff |= aB[i] ^ bB[i];
  return diff === 0;
}

export async function generateAdminToken(): Promise<string> {
  const expires = Date.now() + TOKEN_TTL;
  const payload = `admin:${expires}`;
  const sig = await hmacSha256(SECRET, payload);
  return Buffer.from(JSON.stringify({ expires, sig })).toString('base64url');
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { expires, sig } = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    if (Date.now() > expires) return false;
    const expected = await hmacSha256(SECRET, `admin:${expires}`);
    return timingSafeEqual(sig, expected);
  } catch {
    return false;
  }
}

// نقبل فقط توكن HMAC موقّع ومحدود الصلاحية — لا نقبل السر الخام أبداً
export async function isAdminAuthorized(authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return false;
  return verifyAdminToken(token);
}

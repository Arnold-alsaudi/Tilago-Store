// يُشغَّل عند بدء التشغيل — يتحقق من كل الـ secrets المطلوبة
const REQUIRED = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'ADMIN_SECRET',
  'ENCRYPTION_KEY',
  'HASH_SALT',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'PAYMOB_SECRET_KEY',
  'PAYMOB_PUBLIC_KEY',
  'PAYMOB_INTEGRATION_ID',
  'PAYMOB_HMAC_SECRET',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
  'WHATSAPP_PHONE',
  'CALLMEBOT_API_KEY',
];

export function validateEnv() {
  const missing = REQUIRED.filter(k => !process.env[k]);
  if (missing.length > 0) {
    console.error('[Security] Missing required env vars:', missing.join(', '));
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing env vars: ${missing.join(', ')}`);
    }
  }

  // التحقق من طول ENCRYPTION_KEY
  const key = process.env.ENCRYPTION_KEY ?? '';
  if (key && key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)');
  }

  // التحقق من طول ADMIN_SECRET
  const adminSecret = process.env.ADMIN_SECRET ?? '';
  if (adminSecret.length < 16) {
    console.warn('[Security] ADMIN_SECRET is too short — use at least 16 characters');
  }
}

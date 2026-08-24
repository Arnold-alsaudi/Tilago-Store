// رابط الموقع الرسمي — يُستخدم في الـ SEO (metadata / sitemap / robots / structured data).
// يمكن تغييره لدومين مخصص لاحقاً عبر متغيّر البيئة NEXT_PUBLIC_SITE_URL.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://tilago-store-rtp2.vercel.app').replace(/\/+$/, '');
export const SITE_NAME = 'Tilago';

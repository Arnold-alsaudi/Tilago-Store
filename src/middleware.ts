import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isAdminAuthorized } from '@/lib/adminAuth';

const ADMIN_ROUTES = ['/api/admin'];

// الطلب جايّ من نفس الموقع؟
//
// المقارنة بـ NEXTAUTH_URL لوحدها كانت هشّة: أي دومين تاني للنشر نفسه (www،
// دومين مخصص، أو رابط preview على Vercel) بيخلّي كل نداءات الـ API من المتصفح
// ترجع 403. الأساس الصح هو مقارنة الـ Origin بالمضيف اللي الطلب نفسه وصل عليه،
// وبعدها NEXTAUTH_URL و ALLOWED_ORIGINS كإضافات.
function isSameSite(req: NextRequest, origin: string): boolean {
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false; // Origin مش رابط صالح — نرفض
  }

  const selfHosts = [
    req.headers.get('x-forwarded-host'),
    req.headers.get('host'),
    req.nextUrl.host,
  ].filter(Boolean) as string[];

  if (selfHosts.includes(originHost)) return true;

  const extra = [
    process.env.NEXTAUTH_URL,
    ...(process.env.ALLOWED_ORIGINS ?? '').split(','),
  ]
    .map(s => (s ?? '').trim())
    .filter(Boolean);

  return extra.some(entry => {
    try {
      return new URL(entry).host === originHost;
    } catch {
      return entry === originHost; // مسموح كتابة المضيف من غير بروتوكول
    }
  });
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // مسارات الرفع تعدي مباشرة — middleware بيكسر multipart/form-data
  if (pathname === '/api/admin/upload' || pathname === '/api/upload/logo') {
    return NextResponse.next();
  }

  // نبعت الـ request headers صح عشان FormData و multipart يشتغلوا في الـ route handlers
  const res = NextResponse.next({ request: { headers: new Headers(req.headers) } });

  // ── Security Headers على كل الـ responses ──────────────────
  // ملفات التركيبات بتتعرض في إطار جوه صفحة الأوفرلي (المعاينة الحيّة)،
  // فمينفعش نمنع تأطيرها زي باقي الموقع. بنسمح من نفس الموقع بس — أي دومين
  // تاني لسه ممنوع يحطها عنده. باقي الصفحات فاضلة DENY زي ما هي.
  const framableAsset = pathname.startsWith('/overlays/');

  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', framableAsset ? 'SAMEORIGIN' : 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      // 'unsafe-eval' في بيئة التطوير بس (Next.js HMR بيحتاجه) — بيتشال تلقائياً في الإنتاج
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : ''} https://accept.paymob.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
      "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://img.youtube.com https://i.ytimg.com",
      "media-src 'self' blob: https://res.cloudinary.com",
      "connect-src 'self' https://accept.paymob.com https://accounts.google.com https://api.cloudinary.com",
      // 'self' لازمة عشان صفحة الأوفرلي تعرض التركيبة الحيّة في إطار من نفس
      // الموقع. مابتفتحش أي مصدر برّاني — frame-ancestors تحت لسه 'none'،
      // يعني محدش تاني يقدر يحط موقعنا في إطار عنده.
      "frame-src 'self' https://accept.paymob.com https://accounts.google.com https://www.youtube-nocookie.com",
      framableAsset ? "frame-ancestors 'self'" : "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://accounts.google.com",
    ].join('; ')
  );

  // ── حماية Admin Routes — Bearer token أو جلسة أدمن ──────────
  if (ADMIN_ROUTES.some(r => pathname.startsWith(r))) {
    if (!await isAdminAuthorized(req.headers.get('authorization'))) {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if ((token as { role?: string } | null)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    return res;
  }

  // ── CORS — منع الـ API من خارج الموقع ──────────────────────
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    const origin = req.headers.get('origin');
    if (origin && !isSameSite(req, origin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return res;
}

export const config = {
  matcher: [
    // api/admin/upload مستثنى تماماً من الـ matcher عشان FormData لا تتكسر
    '/api/((?!admin/upload).*)',
    '/((?!_next/static|_next/image|favicon.ico|api/admin/upload|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};

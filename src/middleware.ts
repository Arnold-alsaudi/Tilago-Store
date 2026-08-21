import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isAdminAuthorized } from '@/lib/adminAuth';

const ADMIN_ROUTES = ['/api/admin'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // الـ upload route يعدي مباشرة — middleware بيكسر multipart/form-data
  if (pathname === '/api/admin/upload') {
    return NextResponse.next();
  }

  // نبعت الـ request headers صح عشان FormData و multipart يشتغلوا في الـ route handlers
  const res = NextResponse.next({ request: { headers: new Headers(req.headers) } });

  // ── Security Headers على كل الـ responses ──────────────────
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
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
      "connect-src 'self' https://accept.paymob.com https://accounts.google.com",
      "frame-src https://accept.paymob.com https://accounts.google.com https://www.youtube-nocookie.com",
      "frame-ancestors 'none'",
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
    // الدومين الأساسي من NEXTAUTH_URL — وأي دومينات إضافية من ALLOWED_ORIGINS
    // (مفصولة بفواصل) — مفيش دومين مكتوب ثابت هنا
    const allowedOrigins = [
      process.env.NEXTAUTH_URL ?? 'http://localhost:3000',
      ...(process.env.ALLOWED_ORIGINS ?? '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
    ];
    if (origin && !allowedOrigins.includes(origin)) {
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

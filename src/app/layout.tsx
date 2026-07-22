import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { PageTransition } from '@/components/PageTransition';
import { Analytics } from '@vercel/analytics/react';
import { validateEnv } from '@/lib/validateEnv';

validateEnv();

export const metadata: Metadata = {
  title: 'Tilago | Store',
  description: 'اليرتات احترافية جاهزة للبث المباشر — ماسية، ذهبية، بلاتينية، أنمي، ثلجية، نارية',
  keywords: ['اليرتات', 'بث مباشر', 'تويتش', 'يوتيوب', 'stream alerts', 'Tilago'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body style={{ fontFamily: "'Cairo', '29LtBukra', 'Montserrat', sans-serif", background: 'linear-gradient(180deg,#0F083B,#0C0516)', color: '#e0e0ff', minHeight: '100vh' }}>
<Providers>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Header />
            <main><PageTransition>{children}</PageTransition></main>
            <SiteFooter />
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

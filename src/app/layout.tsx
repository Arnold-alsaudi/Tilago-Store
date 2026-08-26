import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { StorePausedBanner } from '@/components/StorePausedBanner';
import { SiteFooter } from '@/components/SiteFooter';
import { PageTransition } from '@/components/PageTransition';
import { Analytics } from '@vercel/analytics/react';
import { validateEnv } from '@/lib/validateEnv';
import { SITE_URL, SITE_NAME } from '@/lib/site';

validateEnv();

const DESCRIPTION =
  'Tilago Store | متجر متخصص بتصميم و بيع الاليرتات و باكدجات ستريم و 3D و جميع ما يخص محتوى البثوث تصميم و بيع الاليرتات بجميع انواعها العمل على اعدادات بث كاملة تصميم و بيع بكجات بث كاملة';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Tilago Alert',
    template: '%s | Tilago',
  },
  description: DESCRIPTION,
  applicationName: 'Tilago Store',
  keywords: [
    'Tilago', 'تيلاجو', 'Tilago Store', 'تيلاجو ستور', 'تيلاجو ستريم',
    'اليرتات', 'أليرتات', 'اليرت', 'بث مباشر', 'تويتش', 'يوتيوب',
    'stream alerts', 'overlays', 'أوفرلاي', 'تصاميم بث', 'ثري دي',
  ],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'Tilago | تيلاجو — متجر أليرتات وتصاميم البث المباشر',
    description: DESCRIPTION,
    url: SITE_URL,
    locale: 'ar_EG',
    images: [{ url: '/images.png', alt: 'Tilago' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tilago | تيلاجو',
    description: DESCRIPTION,
    images: ['/images.png'],
  },
  icons: { icon: '/icon.png' },
};

// بيانات منظّمة (JSON-LD) تساعد جوجل يفهم اسم العلامة وبدائله (عربي/إنجليزي)
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Tilago',
      alternateName: ['تيلاجو', 'Tilago Store', 'تيلاجو ستور'],
      url: SITE_URL,
      logo: `${SITE_URL}/images.png`,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Tilago',
      alternateName: 'تيلاجو',
      url: SITE_URL,
      inLanguage: 'ar',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </head>
      <body style={{ fontFamily: "'Cairo', '29LtBukra', 'Montserrat', sans-serif", background: 'linear-gradient(180deg,#0F083B,#0C0516)', color: '#e0e0ff', minHeight: '100vh' }}>
<Providers>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Header />
            <StorePausedBanner />
            <main><PageTransition>{children}</PageTransition></main>
            <SiteFooter />
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

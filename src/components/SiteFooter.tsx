import Link from 'next/link';
import { CardBrands } from './CardBrands';
import { PayPalLogo } from './PayPalLogo';

/* ── روابط التواصل ──────────────────────────────────────────
   حط الروابط الحقيقية هنا. الأيقونة اللي رابطها فاضي مابتظهرش أصلاً،
   عشان مايبقاش في الفوتر زرار بيودّي لأي حتة. */
const SOCIAL = [
  { icon: 'fab fa-whatsapp',  label: 'واتساب',    href: '' },
  { icon: 'fab fa-telegram',  label: 'تيليجرام',  href: '' },
  { icon: 'fab fa-discord',   label: 'ديسكورد',   href: '' },
  { icon: 'fab fa-instagram', label: 'إنستجرام',  href: '' },
  { icon: 'fab fa-tiktok',    label: 'تيك توك',   href: '' },
  { icon: 'fab fa-youtube',   label: 'يوتيوب',    href: '' },
];

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'المتجر',
    links: [
      { href: '/alerts',  label: 'الاليرتات' },
      { href: '/stream',  label: 'الاوفرليات' },
      { href: '/3d',      label: 'ثري دي' },
      { href: '/videos',  label: 'الفيديوهات' },
      { href: '/package', label: 'الباقات' },
    ],
  },
  {
    title: 'الإيسبورتس',
    links: [
      { href: '/esports/pubg', label: 'بطولة ببجي' },
      { href: '/esports/tdm',  label: 'TDM' },
      { href: '/developer',    label: 'خدمات المطوّرين' },
    ],
  },
  {
    title: 'حسابك',
    links: [
      { href: '/cart',    label: 'سلة الشراء' },
      { href: '/orders',  label: 'طلباتي' },
      { href: '/contact', label: 'تواصل معنا' },
    ],
  },
];

export function SiteFooter() {
  // سنة تلقائية — كانت مكتوبة 2025 ثابتة وقديمة
  const year = new Date().getFullYear();
  const social = SOCIAL.filter(s => s.href);

  return (
    <footer className="ft" dir="rtl">
      <style>{`
        /* ألوان الموقع الأربعة + درجات نص من لون فاتح واحد. حدود وتعبئة
           بدل التوهّج — مفيش أي box-shadow ملوّن هنا. */
        .ft{
          --v:#7F3AA1; --d:#5416B5; --bg2:#0C0516;
          --ink:#EDE9F7;
          --ink-65:rgba(237,233,247,.65);
          --ink-45:rgba(237,233,247,.45);
          --line:rgba(127,58,161,.22);
          background:var(--bg2);
          border-top:1px solid var(--line);
          padding:56px 5% 28px;
          font-family:'Cairo','29LtBukra','Montserrat',sans-serif;
          color:var(--ink-65);
        }
        .ft-in{max-width:1240px;margin:0 auto;}

        /* العلامة في ناحية والأقسام في شبكة خاصة بيها — كده التلات أقسام
           بيفضلوا متساويين مع بعض بدل ما واحد ينزل لوحده ويسيب فراغ. */
        .ft-top{
          display:grid;
          grid-template-columns:minmax(240px,1.15fr) 2fr;
          gap:40px 44px;
          padding-bottom:36px;
        }
        .ft-nav{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}

        /* العلامة */
        .ft-brand{display:flex;flex-direction:column;gap:14px;align-items:flex-start;}
        .ft-logo{height:44px;width:auto;object-fit:contain;mix-blend-mode:screen;}
        .ft-about{font-size:.86rem;line-height:1.9;color:var(--ink-45);max-width:34ch;margin:0;}

        .ft-social{display:flex;gap:9px;flex-wrap:wrap;}
        .ft-social a{
          width:40px;height:40px;border-radius:11px;
          display:flex;align-items:center;justify-content:center;
          border:1px solid var(--line);background:rgba(84,22,181,.10);
          color:var(--ink-65);font-size:1rem;text-decoration:none;
          transition:background .2s,border-color .2s,color .2s;
        }
        .ft-social a:hover{background:rgba(84,22,181,.30);border-color:var(--v);color:var(--ink);}
        .ft-social a:focus-visible{outline:2px solid var(--v);outline-offset:2px;}

        /* الأعمدة */
        .ft-col h3{
          font-family:'Oxanium','29LtBukra',sans-serif;font-size:.82rem;font-weight:800;
          letter-spacing:1px;color:var(--ink);margin:0 0 14px;
        }
        .ft-col ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;}
        .ft-col a{
          display:block;padding:7px 0;font-size:.86rem;color:var(--ink-45);
          text-decoration:none;transition:color .2s;
        }
        .ft-col a:hover{color:var(--ink);}
        .ft-col a:focus-visible{outline:2px solid var(--v);outline-offset:2px;border-radius:4px;}

        /* الشريط السفلي */
        .ft-bottom{
          border-top:1px solid var(--line);padding-top:22px;
          display:flex;align-items:center;justify-content:space-between;
          gap:18px;flex-wrap:wrap;
        }
        .ft-copy{font-size:.8rem;color:var(--ink-45);margin:0;}
        .ft-pay{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
        .ft-pay-l{font-size:.76rem;color:var(--ink-45);display:inline-flex;align-items:center;gap:6px;}

        @media(max-width:900px){
          .ft{padding:44px 6% 24px;}
          .ft-top{grid-template-columns:1fr;gap:32px;}
          .ft-about{max-width:none;}
        }
        @media(max-width:620px){
          /* الأقسام بتتكدّس بدل ما تتضغط في أعمدة ضيقة تكسّر الأسماء */
          .ft-nav{grid-template-columns:1fr;gap:20px;}
          .ft-bottom{flex-direction:column;align-items:flex-start;gap:14px;}
        }
      `}</style>

      <div className="ft-in">
        <div className="ft-top">
          <div className="ft-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images.png" alt="Tilago" className="ft-logo" />
            <p className="ft-about">
              اليرتات وباكدجات بث احترافية بتصميم حصري — تسليم سريع، تخصيص كامل بشعارك، ودعم بعد التسليم.
            </p>
            {social.length > 0 && (
              <div className="ft-social">
                {social.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                     aria-label={s.label} title={s.label}>
                    <i className={s.icon} aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="ft-nav">
            {COLUMNS.map(col => (
              <nav className="ft-col" key={col.title} aria-label={col.title}>
                <h3>{col.title}</h3>
                <ul>
                  {col.links.map(l => (
                    <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="ft-bottom">
          <p className="ft-copy">© {year} Tilago — جميع الحقوق محفوظة.</p>
          <div className="ft-pay">
            <span className="ft-pay-l"><i className="fas fa-lock" aria-hidden="true" /> دفع آمن</span>
            <CardBrands height={18} />
            <PayPalLogo height={18} />
          </div>
        </div>
      </div>
    </footer>
  );
}

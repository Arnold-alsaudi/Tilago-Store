import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Developer',
  description: 'تطوير مواقع وتطبيقات وألعاب، وتنظيم سيرفرات ديسكورد كاملة وبناء بوتات احترافية — خدمات تطوير احترافية من Tilago.',
};

/* ─── Data ─────────────────────────────────────────── */
const DEV_SERVICES = [
  {
    icon: 'fas fa-globe', color: '#7dd3fc',
    title: 'تطوير المواقع',
    desc: 'مواقع ومتاجر إلكترونية سريعة وآمنة بأحدث التقنيات، بتصميم متجاوب يظهر مثالي على كل الأجهزة.',
    tags: ['متاجر إلكترونية', 'لوحات تحكم', 'مواقع تعريفية', 'أداء وسرعة'],
  },
  {
    icon: 'fas fa-mobile-screen-button', color: '#c084f5',
    title: 'تطوير التطبيقات',
    desc: 'تطبيقات موبايل احترافية (أندرويد و iOS) بتجربة استخدام سلسة وواجهات عصرية تناسب مشروعك.',
    tags: ['أندرويد', 'iOS', 'تطبيقات هجينة', 'ربط APIs'],
  },
  {
    icon: 'fas fa-gamepad', color: '#ff8a3d',
    title: 'تطوير الألعاب',
    desc: 'ألعاب ومشاريع تفاعلية بجرافيك مميز وأداء عالي، من الفكرة للتنفيذ الكامل.',
    tags: ['ألعاب 2D / 3D', 'أنظمة داخل اللعبة', 'تحسين الأداء', 'تجربة لعب'],
  },
];

const DISCORD_SERVICES = [
  {
    icon: 'fas fa-robot', color: '#5865F2',
    title: 'بوتات مخصصة',
    desc: 'بوتات ديسكورد بأي مهام تحتاجها — إدارة، ترحيب، حماية، تذاكر دعم، اقتصاد، وأكثر.',
  },
  {
    icon: 'fas fa-users-gear', color: '#9B59D0',
    title: 'تنظيم السيرفرات',
    desc: 'هيكلة كاملة للسيرفر: رومات مرتبة، أقسام، صلاحيات، وتصميم منظّم واحترافي.',
  },
  {
    icon: 'fas fa-user-shield', color: '#4FE3B8',
    title: 'رولات وصلاحيات',
    desc: 'نظام رولات متكامل بألوان وصلاحيات مدروسة، ونظام مستويات (Levels) وتفاعل.',
  },
  {
    icon: 'fas fa-server', color: '#F5C542',
    title: 'إعداد سيرفر كامل',
    desc: 'سيرفر ديسكورد جاهز من الصفر — تصميم، بوتات، حماية، وتنظيم كامل باحترافية.',
  },
];

const FEATURES = [
  { icon: 'fas fa-gem',        title: 'جودة احترافية',  desc: 'شغل نظيف ومدروس بأعلى المعايير، يليق باسمك ومشروعك.' },
  { icon: 'fas fa-bolt',       title: 'تسليم سريع',     desc: 'ننجز مشروعك في أسرع وقت ممكن دون أي تنازل عن الجودة.' },
  { icon: 'fas fa-sliders',    title: 'تخصيص كامل',     desc: 'كل شيء مبني حسب احتياجك بالظبط — من الفكرة للتفاصيل.' },
  { icon: 'fas fa-headset',    title: 'دعم مستمر',      desc: 'فريقنا معاك خطوة بخطوة، وبعد التسليم كمان.' },
];

const CONTACTS = [
  { icon: 'fab fa-whatsapp', label: 'واتساب',      sub: 'ابدأ مشروعك الآن',     href: 'https://wa.me/1234567890',      c: '#25D366' },
  { icon: 'fab fa-telegram', label: 'تيليجرام',    sub: 'تواصل معنا مباشرة',    href: 'https://t.me/yourchannel',      c: '#0088cc' },
  { icon: 'fab fa-discord',  label: 'ديسكورد',     sub: 'انضم لسيرفر الدعم',    href: 'https://discord.gg/yourserver', c: '#5865F2' },
  { icon: 'fas fa-headset',  label: 'الدعم الفني', sub: 'نرد خلال 24 ساعة',     href: 'mailto:support@tilago.com',     c: '#9B59D0' },
];

const TICKER = ['Web Development', 'Mobile Apps', 'Game Dev', 'Discord Bots', 'Server Setup', 'UI / UX', 'APIs', 'Automation'];

/* ─── Page ─────────────────────────────────────────── */
export default function DeveloperPage() {
  return (
    <div className="dv" dir="rtl">
      <style>{`
        *,*::before,*::after{box-sizing:border-box;}
        .dv{min-height:100vh;background:linear-gradient(180deg,#0F083B,#0C0516);color:#d0cce8;
          font-family:'Cairo','29LtBukra','Montserrat',sans-serif;overflow-x:hidden;}

        /* ── Hero ── */
        .dv-hero{width:100%;margin-top:24px;padding:0 18px;}
        .dv-hero-box{max-width:1400px;margin:0 auto;position:relative;border-radius:28px;overflow:hidden;
          height:clamp(240px,42vw,600px);border:1px solid rgba(127,58,161,0.25);box-shadow:0 12px 60px rgba(0,0,0,0.5);}
        .dv-hero-box img{width:100%;height:100%;object-fit:cover;object-position:center;display:block;}
        .dv-hero-cta{display:inline-flex;align-items:center;gap:10px;margin-top:8px;padding:.85rem 2rem;border-radius:50px;
          background:linear-gradient(135deg,#5416B5,#7F3AA1);color:#fff;font-weight:800;font-size:.95rem;text-decoration:none;
          box-shadow:0 8px 26px rgba(84,22,181,0.5);transition:transform .25s,box-shadow .25s;}
        .dv-hero-cta:hover{transform:translateY(-3px);box-shadow:0 12px 34px rgba(84,22,181,0.65);}

        /* ── Ticker ── */
        .dv-ticker{margin-top:26px;height:44px;overflow:hidden;position:relative;
          border-top:1px solid rgba(84,22,181,0.14);border-bottom:1px solid rgba(84,22,181,0.14);background:rgba(84,22,181,0.04);}
        .dv-ticker-track{display:flex;align-items:center;height:100%;white-space:nowrap;width:max-content;animation:dvTick 30s linear infinite;}
        @keyframes dvTick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .dv-ticker-item{display:inline-flex;align-items:center;gap:9px;padding:0 28px;font-family:'Oxanium',sans-serif;
          font-size:.72rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(170,155,205,0.4);}
        .dv-ticker-item i{color:rgba(155,89,208,0.55);font-size:.5rem;}

        /* ── Section head ── */
        .dv-head{text-align:center;padding:clamp(46px,7vw,80px) 5% 30px;}
        .dv-head-tag{display:inline-block;font-family:'Oxanium',sans-serif;font-size:.65rem;font-weight:800;letter-spacing:4px;
          text-transform:uppercase;color:rgba(155,89,208,0.75);padding:6px 20px;border-radius:50px;
          border:1px solid rgba(155,89,208,0.2);background:rgba(84,22,181,0.06);margin-bottom:16px;}
        .dv-head h2{font-family:'Oxanium','29LtBukra',sans-serif;font-weight:900;font-size:clamp(1.7rem,4vw,2.6rem);
          color:#eae6ff;margin:0 0 10px;line-height:1.25;}
        .dv-head h2 span{background:linear-gradient(120deg,#c084f5,#9B59D0);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
        .dv-head p{color:rgba(180,168,215,0.5);font-size:.95rem;max-width:520px;margin:0 auto;line-height:1.8;}

        /* ── Grids ── */
        .dv-grid{max-width:1180px;margin:0 auto;padding:0 5% 10px;display:grid;gap:1.4rem;
          grid-template-columns:repeat(auto-fit,minmax(280px,1fr));}
        .dv-grid-4{grid-template-columns:repeat(auto-fit,minmax(240px,1fr));}

        .dv-card{position:relative;background:rgba(15,8,59,0.55);border:1px solid rgba(84,22,181,0.2);border-radius:20px;
          padding:2rem 1.6rem;transition:transform .3s cubic-bezier(.25,.8,.25,1),border-color .3s,box-shadow .3s;overflow:hidden;}
        .dv-card::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(84,22,181,0.14),transparent 65%);opacity:0;transition:opacity .3s;}
        .dv-card:hover{transform:translateY(-8px);border-color:rgba(155,89,208,0.5);box-shadow:0 20px 50px rgba(84,22,181,0.25);}
        .dv-card:hover::before{opacity:1;}
        .dv-card-icon{position:relative;width:60px;height:60px;border-radius:18px;display:flex;align-items:center;justify-content:center;
          font-size:1.5rem;margin-bottom:1.2rem;}
        .dv-card h3{position:relative;font-family:'Oxanium','29LtBukra',sans-serif;font-weight:800;font-size:1.25rem;color:#f0ecff;margin:0 0 .7rem;}
        .dv-card p{position:relative;color:rgba(180,168,215,0.6);font-size:.9rem;line-height:1.8;margin:0;}
        .dv-card-tags{position:relative;display:flex;flex-wrap:wrap;gap:7px;margin-top:1.2rem;}
        .dv-card-tag{font-size:.72rem;font-weight:700;padding:.35rem .8rem;border-radius:8px;
          background:rgba(84,22,181,0.14);border:1px solid rgba(155,89,208,0.22);color:#c8b8f0;}

        /* ── Features ── */
        .dv-features{background:linear-gradient(180deg,#0C0516,#0F083B);border-top:1px solid rgba(84,22,181,0.14);border-bottom:1px solid rgba(84,22,181,0.14);
          margin-top:clamp(46px,7vw,80px);padding:clamp(46px,7vw,72px) 5%;}
        .dv-features-grid{max-width:1100px;margin:0 auto;display:grid;gap:1.2rem;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));}
        .dv-feat{background:rgba(15,8,59,0.5);border:1px solid rgba(84,22,181,0.15);border-radius:16px;padding:1.8rem 1.4rem;text-align:center;
          transition:border-color .3s,transform .3s;}
        .dv-feat:hover{border-color:rgba(127,58,161,0.5);transform:translateY(-5px);}
        .dv-feat-icon{width:52px;height:52px;border-radius:14px;margin:0 auto 1rem;display:flex;align-items:center;justify-content:center;
          font-size:1.3rem;color:#9B59D0;background:rgba(84,22,181,0.18);border:1px solid rgba(127,58,161,0.3);}
        .dv-feat h4{font-family:'Oxanium','29LtBukra',sans-serif;font-weight:800;font-size:1.05rem;color:#eae6ff;margin:0 0 .5rem;}
        .dv-feat p{color:rgba(170,158,200,0.6);font-size:.83rem;line-height:1.7;margin:0;}

        /* ── CTA ── */
        .dv-cta{max-width:900px;margin:clamp(50px,7vw,80px) auto 0;padding:0 5%;}
        .dv-cta-box{position:relative;border-radius:26px;overflow:hidden;text-align:center;padding:clamp(2.5rem,5vw,3.5rem) 1.5rem;
          background:#08040f;border:1px solid rgba(155,89,208,0.3);}
        .dv-cta-box::before{content:'';position:absolute;inset:0;background-image:url('/photo/tilago-emblem.png');
          background-repeat:no-repeat;background-position:center;background-size:min(72%,440px);opacity:0.38;pointer-events:none;}
        .dv-cta-box > *{position:relative;z-index:1;}
        .dv-cta-box h2{font-family:'Oxanium','29LtBukra',sans-serif;font-weight:900;font-size:clamp(1.5rem,3.5vw,2.3rem);color:#fff;margin:0 0 .8rem;}
        .dv-cta-box p{color:rgba(220,210,240,0.7);font-size:.95rem;max-width:480px;margin:0 auto 1.8rem;line-height:1.8;}

        /* ── Contacts ── */
        .dv-contacts{max-width:900px;margin:0 auto;padding:clamp(44px,6vw,64px) 5% clamp(50px,7vw,80px);}
        .dv-contacts-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:.9rem;}
        @media(max-width:560px){.dv-contacts-grid{grid-template-columns:1fr;}}
        .dv-contact{display:flex;align-items:center;gap:15px;padding:1.1rem 1.3rem;border-radius:16px;text-decoration:none;
          background:rgba(15,8,59,0.55);border:1px solid rgba(84,22,181,0.2);transition:all .3s cubic-bezier(.25,.8,.25,1);}
        .dv-contact:hover{transform:translateY(-3px);border-color:rgba(155,89,208,0.45);box-shadow:0 12px 34px rgba(84,22,181,0.25);}
        .dv-contact-icon{width:50px;height:50px;border-radius:14px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.4rem;}
        .dv-contact-txt{flex:1;}
        .dv-contact-label{font-weight:800;color:#ece8ff;font-size:1rem;}
        .dv-contact-sub{font-size:.75rem;color:rgba(170,160,205,0.5);margin-top:2px;}
        .dv-contact-arrow{color:rgba(155,89,208,0.3);font-size:.85rem;transition:all .25s;}
        .dv-contact:hover .dv-contact-arrow{color:rgba(155,89,208,0.8);transform:translateX(-5px);}
      `}</style>

      {/* ── HERO ── */}
      <section className="dv-hero">
        <div className="dv-hero-box">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/55.png" alt="Tilago" />
        </div>
      </section>

      {/* ── Ticker ── */}
      <div className="dv-ticker">
        <div className="dv-ticker-track">
          {[...TICKER, ...TICKER].map((w, i) => (
            <span key={i} className="dv-ticker-item"><i className="fas fa-circle" /> {w}</span>
          ))}
        </div>
      </div>

      {/* ── Dev Services ── */}
      <div className="dv-head">
        <span className="dv-head-tag">Development</span>
        <h2>كل ما يخص <span>المطوّرين</span></h2>
        <p>حلول برمجية متكاملة من الفكرة للتنفيذ — بأعلى جودة وأحدث التقنيات.</p>
      </div>
      <div className="dv-grid">
        {DEV_SERVICES.map(s => (
          <div key={s.title} className="dv-card">
            <div className="dv-card-icon" style={{ background: `${s.color}1f`, color: s.color, border: `1px solid ${s.color}44` }}>
              <i className={s.icon} />
            </div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            <div className="dv-card-tags">
              {s.tags.map(t => <span key={t} className="dv-card-tag">{t}</span>)}
            </div>
          </div>
        ))}
      </div>

      {/* ── Discord Services ── */}
      <div className="dv-head">
        <span className="dv-head-tag">Discord</span>
        <h2>تنظيم <span>الديسكورد</span> وبناء البوتات</h2>
        <p>سيرفرات احترافية من الصفر — تنظيم، بوتات، رولات، وحماية كاملة.</p>
      </div>
      <div className="dv-grid dv-grid-4">
        {DISCORD_SERVICES.map(s => (
          <div key={s.title} className="dv-card">
            <div className="dv-card-icon" style={{ background: `${s.color}1f`, color: s.color, border: `1px solid ${s.color}44` }}>
              <i className={s.icon} />
            </div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Features ── */}
      <section className="dv-features">
        <div className="dv-head" style={{ padding: '0 0 30px' }}>
          <span className="dv-head-tag">Why Tilago</span>
          <h2>ليه <span>Tilago</span>؟</h2>
        </div>
        <div className="dv-features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="dv-feat">
              <div className="dv-feat-icon"><i className={f.icon} /></div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="dv-cta">
        <div className="dv-cta-box">
          <h2>جاهز تبدأ مشروعك؟</h2>
          <p>احكيلنا فكرتك، وإحنا نحوّلها لواقع احترافي يليق بك.</p>
          <a href="#contact" className="dv-hero-cta">تواصل معنا <i className="fas fa-paper-plane" /></a>
        </div>
      </div>

      {/* ── Contacts ── */}
      <section className="dv-contacts" id="contact">
        <div className="dv-head" style={{ padding: '0 0 26px' }}>
          <span className="dv-head-tag">Contact</span>
          <h2>تواصل <span>معنا</span></h2>
        </div>
        <div className="dv-contacts-grid">
          {CONTACTS.map(b => (
            <a key={b.label} href={b.href} target="_blank" rel="noreferrer" className="dv-contact">
              <div className="dv-contact-icon" style={{ background: `${b.c}18`, color: b.c }}><i className={b.icon} /></div>
              <div className="dv-contact-txt">
                <div className="dv-contact-label">{b.label}</div>
                <div className="dv-contact-sub">{b.sub}</div>
              </div>
              <i className="fas fa-chevron-left dv-contact-arrow" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

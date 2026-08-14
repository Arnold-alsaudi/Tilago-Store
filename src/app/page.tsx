'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { DEFAULT_HOME_CONTENT, type HomeContent } from '@/lib/homeContent';

/* ─── Gallery Data ─── */
const GALLERIES = {
  left: {
    title: 'Gaming Alerts',
    link: '/alerts',
    slides: [
      { src: '/caf.png', alt: 'Gaming Alert 1' },
      { src: '/images.png', alt: 'Gaming Alert 2' },
      { src: '/photo/تكبيس.png', alt: 'Gaming Alert 3' },
    ],
  },
  right: {
    title: 'Esports Designs',
    link: '/stream',
    slides: [
      { src: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=600', alt: 'Esports 1' },
      { src: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600', alt: 'Esports 2' },
      { src: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600', alt: 'Esports 3' },
    ],
  },
};

const FEATURED = [
  { badge: 'NEW',  img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600', title: 'Stream Alerts Pack',   desc: 'Professional animated alerts for your streaming setup', link: '/alerts' },
  { badge: 'HOT',  img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600', title: 'Gaming Logo Design',   desc: 'Custom esports logos with neon effects',              link: '/alerts' },
  { badge: '',     img: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=600', title: 'Discord Themes',      desc: 'Premium Discord server templates and bots',           link: '/stream' },
  { badge: 'SALE', img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600', title: 'Website Templates',  desc: 'Modern responsive designs for gamers',                link: '/package' },
];

/* ─── Gallery Hook ─── */
function useGallery(total: number, autoMs = 5000) {
  const [current, setCurrent] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (idx: number) => setCurrent((idx + total) % total);

  useEffect(() => {
    timer.current = setInterval(() => setCurrent(c => (c + 1) % total), autoMs);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [total, autoMs]);

  return { current, go };
}

/* ─── Gallery Card ─── */
function GalleryCard({ id, data }: { id: string; data: typeof GALLERIES.left }) {
  const { current, go } = useGallery(data.slides.length);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`gallery-container${hovered ? ' hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="gallery-slides">
        {data.slides.map((s, i) => (
          <div key={i} className={`gallery-slide${i === current ? ' active' : ''}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt={s.alt} />
          </div>
        ))}
      </div>

      <button className="gallery-nav prev" onClick={() => go(current - 1)}>
        <i className="fas fa-chevron-left" />
      </button>
      <button className="gallery-nav next" onClick={() => go(current + 1)}>
        <i className="fas fa-chevron-right" />
      </button>

      <div className="gallery-dots">
        {data.slides.map((_, i) => (
          <div key={i} className={`dot${i === current ? ' active' : ''}`} onClick={() => go(i)} />
        ))}
      </div>

      <div className="gallery-title">{data.title}</div>
      <Link href={data.link} className="shop-now-btn">Shop Now</Link>
    </div>
  );
}

/* ─── Showcase Section ─── */
const SHOWCASE_ITEMS = [
  { id:'stream', label:'باكدج ستريم', img:'/photo/venom-1.png',       href:'/stream' },
  { id:'alerts', label:'يرتات',       img:'/photo/alert-special.png', href:'/alerts' },
  { id:'overlay',label:'أوفرلاي',     img:'/photo/venom-5.png',       href:'/stream' },
  { id:'3d',     label:'ثري دي',      img:'/023.png',                 href:'/3d'     },
];

function ShowcaseSection() {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  function switchTo(i: number) {
    if (i === active) return;
    setFading(true);
    setTimeout(() => { setActive(i); setFading(false); }, 280);
  }

  const item = SHOWCASE_ITEMS[active];

  return (
    <section className="sc-wrap">
      <style>{`
        .sc-wrap{
          position:relative;
          overflow:hidden;
          background:linear-gradient(160deg,#0b0322 0%,#130840 50%,#0b0322 100%);
          border-top:1px solid rgba(84,22,181,0.15);
          border-bottom:1px solid rgba(84,22,181,0.15);
          padding:0 48px;
        }

        /* Decorative blobs */
        .sc-blob1,.sc-blob2{position:absolute;border-radius:50%;pointer-events:none}
        .sc-blob1{
          width:400px;height:400px;
          background:radial-gradient(circle,rgba(127,58,161,0.14),transparent 70%);
          right:-80px;top:50%;transform:translateY(-50%);
        }
        .sc-blob2{
          width:200px;height:200px;
          background:radial-gradient(circle,rgba(84,22,181,0.1),transparent 70%);
          left:100px;bottom:-60px;
        }

        .sc-inner{
          max-width:1300px;margin:0 auto;
          display:flex;align-items:center;
          min-height:440px;position:relative;z-index:1;
          direction:rtl;gap:32px;
        }

        /* ── Left panel ── */
        .sc-left{
          flex:0 0 180px;
          display:flex;flex-direction:column;
          justify-content:center;gap:28px;
          padding:48px 0;
        }

        .sc-label{
          font-family:'Cairo','29LtBukra','Montserrat',sans-serif;
          font-size:clamp(1.1rem,2vw,1.5rem);
          font-weight:900;color:#ede8ff;
          transition:opacity .3s,transform .3s;
          line-height:1.3;
        }
        .sc-label.fading{opacity:0;transform:translateY(6px)}

        /* Dot nav */
        .sc-dots{display:flex;flex-direction:column;gap:10px}
        .sc-dot{
          width:8px;height:8px;border-radius:50%;cursor:pointer;
          background:rgba(155,89,208,0.25);
          border:1px solid rgba(155,89,208,0.2);
          transition:all .3s;
        }
        .sc-dot:hover{background:rgba(155,89,208,0.5)}
        .sc-dot.active{
          background:#7F3AA1;
          box-shadow:0 0 10px rgba(127,58,161,0.6);
          width:8px;height:24px;border-radius:4px;
        }

        /* Explore link */
        .sc-link{
          display:inline-flex;align-items:center;gap:8px;
          font-family:'Cairo','29LtBukra','Montserrat';font-size:.82rem;font-weight:700;
          color:rgba(180,165,215,0.55);text-decoration:none;
          transition:color .25s,gap .25s;
        }
        .sc-link:hover{color:#c8b8f0;gap:12px}
        .sc-link i{font-size:.75rem}

        /* ── Right image ── */
        .sc-img-wrap{
          flex:1;
          display:flex;align-items:center;justify-content:flex-end;
          overflow:visible;
          perspective:1200px;
        }
        .sc-img-frame{
          position:relative;
          border-radius:18px;overflow:hidden;
          border:1px solid rgba(155,89,208,0.28);
          box-shadow:
            -20px 28px 70px rgba(0,0,0,0.65),
            -6px 8px 24px rgba(84,22,181,0.2);
          width:78%;
          margin-top:-50px;
          margin-bottom:-50px;
          transform:perspective(1200px) rotateY(-7deg) rotateX(-2deg);
          transition:opacity .3s, transform .5s cubic-bezier(.25,.8,.25,1);
        }
        .sc-img-frame:hover{
          transform:perspective(1200px) rotateY(-3deg) rotateX(-1deg) scale(1.02);
          box-shadow:
            -28px 36px 90px rgba(0,0,0,0.7),
            -8px 12px 32px rgba(84,22,181,0.28);
        }
        .sc-img-frame.fading{
          opacity:0;
          transform:perspective(1200px) rotateY(14deg) rotateX(-2deg) scale(0.97);
        }
        .sc-img-frame img{
          width:100%;height:400px;
          object-fit:cover;object-position:center top;
          display:block;
          image-rendering:-webkit-optimize-contrast;
        }
        /* Blend left edge into background */
        .sc-img-fade-left{
          position:absolute;top:0;left:0;bottom:0;width:70px;
          background:linear-gradient(270deg,rgba(11,3,34,0.85),transparent);
          pointer-events:none;z-index:1;
        }

        @media(max-width:900px){
          .sc-wrap{padding:36px 20px 0}
          .sc-inner{flex-direction:column;min-height:auto;gap:20px;padding-bottom:28px;direction:rtl}
          .sc-left{flex:none;padding:0;width:100%;flex-direction:row;align-items:center;justify-content:space-between;gap:16px}
          .sc-dots{flex-direction:row}
          .sc-dot.active{width:24px;height:8px;border-radius:4px}
          .sc-img-wrap{width:100%;justify-content:center}
          .sc-img-frame{width:100%;margin:-16px 0;transform:none}
          .sc-img-frame:hover{transform:scale(1.01)}
          .sc-img-frame img{height:220px}
        }
        @media(max-width:480px){
          .sc-img-frame img{height:170px}
          .sc-img-frame{border-radius:12px}
        }
      `}</style>

      {/* Decorative blobs */}
      <div className="sc-blob1"/>
      <div className="sc-blob2"/>

      <div className="sc-inner">
        {/* Left */}
        <div className="sc-left">
          <div className={`sc-label${fading?' fading':''}`}>{item.label}</div>
          <div className="sc-dots">
            {SHOWCASE_ITEMS.map((_,i)=>(
              <div key={i} className={`sc-dot${active===i?' active':''}`} onClick={()=>switchTo(i)}/>
            ))}
          </div>
          <a href={item.href} className="sc-link">
            استعرض الأعمال <i className="fas fa-arrow-left"/>
          </a>
        </div>

        {/* Right — 3D overflowing image */}
        <div className="sc-img-wrap">
          <div className={`sc-img-frame${fading?' fading':''}`}>
            <div className="sc-img-fade-left"/>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.img} alt={item.label}/>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Feature Showcase (3 كروت + خلفية فيديو متحركة) ─── */
const FSC_CARDS = [
  { img: '/photo/alert-special.png', title: '3D',    desc: 'اليرتات جاهزة ومصمّمة باحترافية ترفع تفاعل مشاهديك وتخلّي قناتك مميّزة عن الجميع.' },
  { img: '/photo/venom-1.png',       title: 'Stream',   desc: 'أوفرلاي وشاشات بدء وإنهاء ويرتات — كل ما يحتاجه بثّك في باقة واحدة متكاملة.' },
  { img: '/photo/alert-special.png', title: 'Alert', desc: 'شعارات وإنتروهات ومشاهد ثلاثية الأبعاد سينمائية تمنح قناتك بُعداً احترافياً مبهراً.' },
];

function FeatureShowcase() {
  return (
    <section className="fsc-sec" dir="rtl">
      <style>{`
        .fsc-sec{position:relative;overflow:hidden;padding:clamp(34px,3.6vw,56px) 5% clamp(60px,7vw,104px);
          background:linear-gradient(160deg,#0b0322 0%,#0f0535 50%,#0b0322 100%);}
        /* خلفية فيديو متحركة — autoplay/loop/muted، من غير أي تحكم */
        .fsc-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
             opacity:.30;pointer-events:none;z-index:0;filter:saturate(1.15);}
        .fsc-overlay{position:absolute;inset:0;z-index:1;pointer-events:none;
              background:
            linear-gradient(180deg,#0b0322 0%,rgba(11,3,34,0) 15%,rgba(11,3,34,0) 85%,#0b0322 100%),
            linear-gradient(180deg,rgba(12,5,22,.7),rgba(12,5,22,.9));}

        .fsc-inner{position:relative;z-index:2;max-width:1320px;margin:0 auto;text-align:center;}
        .fsc-sup{display:inline-flex;align-items:center;gap:14px;font-family:'Oxanium',sans-serif;
          font-size:.8rem;font-weight:800;letter-spacing:6px;text-transform:uppercase;margin-bottom:18px;color:rgba(196,160,224,.8);}
        .fsc-sup::before,.fsc-sup::after{content:'';width:36px;height:1px;background:rgba(155,89,208,.45);}
        .fsc-sup b{background:linear-gradient(90deg,#c084f5,#9B59D0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .fsc-title{font-family:'Oxanium','29LtBukra',sans-serif;font-weight:900;font-style:italic;
          text-transform:uppercase;color:#f0ecff;
          font-size:clamp(2.2rem,5.2vw,4.1rem);line-height:1.04;margin:0 0 16px;letter-spacing:1px;}
        .fsc-sub{font-family:'Cairo','29LtBukra',sans-serif;font-size:clamp(.9rem,1.4vw,1.05rem);
          color:rgba(180,168,215,.55);max-width:560px;margin:0 auto;line-height:1.9;}

        .fsc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;margin-top:clamp(52px,7.5vw,116px);}
        /* من غير بوكس — صورة + كلام مباشرةً على الخلفية (زي المرجع)، من غير رفع عند الـ hover */
        .fsc-card{position:relative;--lift:0px;text-align:center;
          transform:translateY(var(--lift));
          transition:transform .38s cubic-bezier(.25,.8,.25,1);}
        .fsc-card:nth-child(2){--lift:-40px;}
        .fsc-card-media{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:10px;background:rgba(84,22,181,.12);
          box-shadow:0 22px 46px rgba(0,0,0,.5),0 6px 16px rgba(0,0,0,.35);transition:box-shadow .35s ease;}
        .fsc-card-media img{width:100%;height:100%;object-fit:cover;display:block;image-rendering:-webkit-optimize-contrast;}
        /* hover نضيف: يطلع لفوق شوية + نيون بنفسجي بسيط جداً */
        .fsc-card:hover{transform:translateY(calc(var(--lift) - 8px));}
        .fsc-card:hover .fsc-card-media{box-shadow:0 24px 50px rgba(0,0,0,.5),0 0 18px rgba(140,84,255,.35);}
        .fsc-card-media::after{content:'';position:absolute;inset:0;pointer-events:none;
          background:linear-gradient(150deg,rgba(127,58,161,.16),rgba(84,22,181,.05) 55%,transparent);mix-blend-mode:soft-light;}
        .fsc-card-title{font-family:'Oxanium','29LtBukra',sans-serif;font-weight:800;font-style:italic;
          text-transform:uppercase;letter-spacing:2px;
          font-size:clamp(1.2rem,1.8vw,1.55rem);color:#f0ecff;margin:22px 0 12px;padding:0 20px;}
        .fsc-card-desc{font-family:'Cairo','29LtBukra',sans-serif;font-size:.9rem;line-height:1.9;
          color:rgba(180,168,215,.62);padding:0 26px;margin:0;}

        @media(max-width:960px){ .fsc-grid{grid-template-columns:repeat(2,1fr);gap:20px;} .fsc-card:nth-child(2){--lift:0px;} }
        @media(max-width:620px){ .fsc-grid{grid-template-columns:1fr;} .fsc-sec{padding:56px 20px;} }
      `}</style>

      {/* خلفية فيديو متحركة */}
      <video className="fsc-video" autoPlay loop muted playsInline preload="auto" aria-hidden="true">
        <source src="https://res.cloudinary.com/v6vo90hw/video/upload/v1784782950/tilago/tilago.mp4" type="video/mp4"/>
      </video>
      <div className="fsc-overlay"/>

      <div className="fsc-inner">
        <div className="fsc-sup"><b>TILAGO</b></div>
        <h2 className="fsc-title">Welcome To Tilago</h2>
        <p className="fsc-sub">تصاميم حصرية بلمسة سينمائية تخلّي قناتك تتميّز عن الجميع</p>

        <div className="fsc-grid">
          {FSC_CARDS.map((c)=>(
            <div key={c.title} className="fsc-card">
              <div className="fsc-card-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img} alt={c.title}/>
              </div>
              <h3 className="fsc-card-title">{c.title}</h3>
              <p className="fsc-card-desc">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Page ─── */
export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);
  const [formMsg, setFormMsg] = useState('');
  const [content, setContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setIntroVisible(false), 4000);

    // محتوى الصفحة الرئيسية القابل للتعديل من الأدمن
    fetch('/api/settings/home').then(r => r.json()).then(setContent).catch(() => {});

    return () => clearTimeout(t);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormMsg('Message sent successfully!');
    setTimeout(() => setFormMsg(''), 3000);
  }

  return (
    <>
      {/* Intro Overlay */}
      {mounted && introVisible && (
        <div className="intro" id="intro">
          <img src="/images.png" alt="Tilago Logo" className="intro-logo" />
        </div>
      )}

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.heroImage} alt="Tilago Store" />
          </div>
        </div>
      </section>

      {/* Ticker Bar */}
      <section className="ticker-section">
        <div className="ticker-bar">
          <div className="ticker-fade" />
          <div className="ticker-track">
            <span className="ticker-item"><i className="fas fa-bell" /> Alerts</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item"><i className="fab fa-discord" /> خدمات Discord</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item"><i className="fas fa-layer-group" /> الأوفرلاي</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item"><i className="fas fa-video" /> باكدج ستريم</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item"><i className="fa-solid fa-cube" /> 3D</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item"><i className="fas fa-code" /> Developer</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item"><i className="fas fa-bell" /> Alerts</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item"><i className="fab fa-discord" /> خدمات Discord</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item"><i className="fas fa-layer-group" /> الأوفرلاي</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item"><i className="fas fa-video" /> باكدج ستريم</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item"><i className="fa-solid fa-cube" /> 3D</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item"><i className="fas fa-code" /> Developer</span>
            <span className="ticker-sep">✦</span>
          </div>
        </div>
      </section>

      {/* Quick Nav Buttons */}
      <section className="quick-nav-section">
        <div className="quick-nav-grid">
          <Link href="/3d" className="quick-nav-btn" data-reveal="up" data-delay="1">
            <div className="quick-nav-icon">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images.png" alt="Tilago" style={{width:36,height:36,objectFit:'contain',mixBlendMode:'screen'}}/>
            </div>
            3D
          </Link>
          <Link href="/video" className="quick-nav-btn" data-reveal="up" data-delay="2">
            <div className="quick-nav-icon">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images.png" alt="Tilago" style={{width:36,height:36,objectFit:'contain',mixBlendMode:'screen'}}/>
            </div>
            Video
          </Link>
          <Link href="/stream" className="quick-nav-btn" data-reveal="up" data-delay="3">
            <div className="quick-nav-icon">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images.png" alt="Tilago" style={{width:36,height:36,objectFit:'contain',mixBlendMode:'screen'}}/>
            </div>
            Stream
          </Link>
          <Link href="/alerts" className="quick-nav-btn" data-reveal="up" data-delay="4">
            <div className="quick-nav-icon">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images.png" alt="Tilago" style={{width:36,height:36,objectFit:'contain',mixBlendMode:'screen'}}/>
            </div>
            Alerts
          </Link>
        </div>
      </section>

      {/* Platforms Strip */}
      {(() => {
        const row1 = [
          { icon: 'fab fa-twitch',    name: 'Twitch' },
          { icon: 'fab fa-youtube',   name: 'YouTube' },
          { icon: 'fab fa-tiktok',    name: 'TikTok' },
          { icon: 'fab fa-discord',   name: 'Discord' },
          { icon: 'fas fa-video',     name: 'OBS Studio' },
          { icon: 'fab fa-instagram', name: 'Instagram' },
          { icon: 'fas fa-tv',        name: 'Kick' },
        ];
        const row2 = [
          { icon: 'fas fa-gamepad',   name: 'StreamElements' },
          { icon: 'fas fa-film',      name: 'Streamlabs' },
          { icon: 'fab fa-facebook',  name: 'Facebook Live' },
          { icon: 'fas fa-trophy',    name: 'Esports' },
          { icon: 'fas fa-headset',   name: 'XSplit' },
          { icon: 'fas fa-stream',    name: 'Trovo' },
          { icon: 'fas fa-broadcast-tower', name: 'Caffeine' },
        ];
        const items1 = [...row1, ...row1, ...row1];
        const items2 = [...row2, ...row2, ...row2];
        return (
          <section className="platforms-section" id="home">
            <p className="platforms-label">متوافق مع جميع منصات البث</p>
            <div className="platforms-track-wrap">
              <div className="platforms-track track-fwd">
                {items1.map((p, i) => (
                  <div key={i} className="plat-item">
                    <i className={p.icon} />
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="platforms-track-wrap" style={{marginTop:'10px'}}>
              <div className="platforms-track track-bwd">
                {items2.map((p, i) => (
                  <div key={i} className="plat-item">
                    <i className={p.icon} />
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Feature Showcase — 3 كروت بخلفية فيديو متحركة (مكان القسم القديم) */}
      <FeatureShowcase />

      {/* Why Us / Image Grid */}
      <section className="wt-sec" id="about">
        <style>{`
          .wt-sec{padding:80px 48px;background:linear-gradient(160deg,#09021f 0%,#0e0530 55%,#09021f 100%);border-top:1px solid rgba(84,22,181,.12);border-bottom:1px solid rgba(84,22,181,.12);position:relative;overflow:clip}
          .wt-glow{position:absolute;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,rgba(84,22,181,.11) 0%,transparent 70%);left:-120px;top:50%;transform:translateY(-50%);pointer-events:none}
          .wt-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:260px 1fr;gap:44px;align-items:center;position:relative;z-index:1;direction:rtl}
          .wt-left{display:flex;flex-direction:column;gap:0}
          .wt-left h2{font-family:'Cairo','29LtBukra','Montserrat';font-size:clamp(1.8rem,2.8vw,2.5rem);font-weight:900;color:#f0ecff;line-height:1.2;margin-bottom:14px}
          .wt-left h2 em{font-style:normal;background:linear-gradient(90deg,#9B59D0,#c084f5,#7F3AA1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
          .wt-left p{font-family:'Cairo','29LtBukra','Montserrat';font-size:.86rem;line-height:1.8;color:rgba(170,160,205,.42);margin-bottom:28px}
          .wt-stat-row{display:flex;flex-direction:column;gap:12px}
          .wt-stat{display:flex;align-items:center;gap:14px;padding:12px 16px;border-radius:12px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);transition:border-color .3s,background .3s}
          .wt-stat:hover{border-color:rgba(155,89,208,.3);background:rgba(84,22,181,.06)}
          .wt-stat-num{font-family:'Oxanium',sans-serif;font-size:1.35rem;font-weight:900;color:#c4a0e0;min-width:60px;font-variant-numeric:tabular-nums}
          .wt-stat-lbl{font-family:'Cairo','29LtBukra',sans-serif;font-size:.8rem;font-weight:700;color:rgba(200,185,230,.5)}
          .wt-grid{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,175px);gap:12px}
          .wt-card{border-radius:16px;overflow:hidden;position:relative;border:1px solid rgba(255,255,255,.055);transition:border-color .3s,transform .35s,box-shadow .35s;cursor:pointer}
          .wt-card:hover{border-color:rgba(155,89,208,.4);transform:translateY(-5px);box-shadow:0 20px 50px rgba(0,0,0,.5),0 0 0 1px rgba(155,89,208,.18)}
          .wt-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(155,89,208,.6) 50%,transparent);opacity:0;transition:opacity .35s;z-index:3}
          .wt-card:hover::before{opacity:1}
          .wt-card img{width:100%;height:100%;object-fit:cover;object-position:center top;transition:transform .65s cubic-bezier(.25,.8,.25,1);image-rendering:-webkit-optimize-contrast}
          .wt-card:hover img{transform:scale(1.07)}
          .wt-card-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(4,1,12,.92) 0%,transparent 55%);z-index:1}
          .wt-card-label{position:absolute;bottom:12px;right:14px;left:14px;z-index:2}
          .wt-card-tag{font-family:'Cairo','29LtBukra','Montserrat';font-size:.52rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(155,89,208,.7);margin-bottom:3px}
          .wt-card-name{font-family:'Cairo','29LtBukra','Montserrat';font-size:.88rem;font-weight:900;color:#f0ecff;text-shadow:0 2px 8px rgba(0,0,0,.9)}
          @media(max-width:1024px){.wt-inner{grid-template-columns:1fr}.wt-left{flex-direction:row;flex-wrap:wrap}.wt-left h2,.wt-left p{width:100%}.wt-stat-row{flex-direction:row;flex-wrap:wrap}.wt-stat{flex:1 1 140px}}
          @media(max-width:700px){.wt-grid{grid-template-columns:repeat(2,1fr);grid-template-rows:auto}.wt-card[style]{grid-column:span 2!important;grid-row:auto!important;height:210px}.wt-sec{padding:52px 16px}}
          @media(max-width:480px){.wt-grid{grid-template-columns:1fr}.wt-card[style]{grid-column:1!important}}

          /* ── slow side-reveal overrides for wt-sec ── */
          .wt-sec [data-reveal="right"] {
            transform: translateX(80px);
            filter: blur(3px);
            transition: opacity 1.3s cubic-bezier(.16,1,.3,1),
                        transform 1.3s cubic-bezier(.16,1,.3,1),
                        filter 1.3s ease;
            transition-delay: 0s !important;
          }
          .wt-sec [data-reveal="left"] {
            transform: translateX(-80px);
            filter: blur(3px);
            transition: opacity 1.3s cubic-bezier(.16,1,.3,1),
                        transform 1.3s cubic-bezier(.16,1,.3,1),
                        filter 1.3s ease;
            transition-delay: 0.15s !important;
          }
          .wt-sec [data-reveal].sr-in {
            opacity: 1; transform: none; filter: none;
          }
        `}</style>
        <div className="wt-glow"/>
        <div className="wt-inner">
          <div className="wt-left" data-reveal="right">
            <h2>أكثر من مجرد <em>تصميم</em></h2>
            <p>نقدم تجربة متكاملة من التصميم إلى التسليم — بجودة عالية وأسلوب فريد يناسب قناتك</p>
            <div className="wt-stat-row">
              {content.stats.map((s)=>(
                <div className="wt-stat" key={s.label}>
                  <div className="wt-stat-num">{s.num}</div>
                  <div className="wt-stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="wt-grid" data-reveal="left">
            {content.gallery.map((c,i)=>(
              <div key={i} className="wt-card" style={c.featured?{gridColumn:'2',gridRow:'1/3'}:{}}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img} alt={c.name}/>
                <div className="wt-card-overlay"/>
                <div className="wt-card-label">
                  <div className="wt-card-tag">{c.tag}</div>
                  <div className="wt-card-name">{c.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="services-section">
        <div className="services-header" data-reveal="up">
          <span className="services-tag">خدماتنا</span>
          <h2>اكتشف ما نقدمه</h2>
          <p>كل ما تحتاجه لقناتك في مكان واحد</p>
        </div>
        <div className="services-grid">
          <Link href="/alerts" className="srv-card" data-reveal="left" data-delay="1">
            <div className="srv-icon"><i className="fas fa-bell" /></div>
            <div className="srv-body">
              <h3>Stream Alerts</h3>
              <p>يرتات احترافية للتنبيهات</p>
            </div>
            <i className="fas fa-arrow-left srv-arrow" />
          </Link>
          <Link href="/stream" className="srv-card" data-reveal="up" data-delay="2">
            <div className="srv-icon"><i className="fas fa-layer-group" /></div>
            <div className="srv-body">
              <h3>Overlay</h3>
              <p>أوفرليات متكاملة للبث</p>
            </div>
            <i className="fas fa-arrow-left srv-arrow" />
          </Link>
          <Link href="/stream" className="srv-card" data-reveal="right" data-delay="3">
            <div className="srv-icon"><i className="fas fa-box-open" /></div>
            <div className="srv-body">
              <h3>Stream Package</h3>
              <p>باكدج بث شامل ومتكامل</p>
            </div>
            <i className="fas fa-arrow-left srv-arrow" />
          </Link>
          <Link href="/contact" className="srv-card" data-reveal="left" data-delay="2">
            <div className="srv-icon"><i className="fab fa-discord" /></div>
            <div className="srv-body">
              <h3>Discord</h3>
              <p>إعداد وتصميم سيرفر كامل</p>
            </div>
            <i className="fas fa-arrow-left srv-arrow" />
          </Link>
          <Link href="/3d" className="srv-card" data-reveal="up" data-delay="3">
            <div className="srv-icon"><i className="fa-solid fa-cube" /></div>
            <div className="srv-body">
              <h3>3D Design</h3>
              <p>تصاميم ثلاثية الأبعاد</p>
            </div>
            <i className="fas fa-arrow-left srv-arrow" />
          </Link>
          <Link href="/contact" className="srv-card" data-reveal="right" data-delay="2">
            <div className="srv-icon"><i className="fas fa-paint-brush" /></div>
            <div className="srv-body">
              <h3>Logo & Branding</h3>
              <p>هوية بصرية احترافية</p>
            </div>
            <i className="fas fa-arrow-left srv-arrow" />
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section id="contact">
        <div className="contact-container">
          <div className="contact-header">
            <p className="contact-tag">تواصل معنا</p>
            <h2>هل لديك مشروع؟</h2>
            <p className="contact-sub">نحن هنا لمساعدتك — تواصل معنا وسنرد في أقرب وقت</p>
          </div>

          <div className="contact-body">
            <div className="contact-info">
              <div className="info-card">
                <i className="fab fa-discord" />
                <div>
                  <span className="info-label">Discord</span>
                  <span className="info-value">Tilago#0000</span>
                </div>
              </div>
              <div className="info-card">
                <i className="fab fa-tiktok" />
                <div>
                  <span className="info-label">TikTok</span>
                  <span className="info-value">@tilago</span>
                </div>
              </div>
              <div className="info-card">
                <i className="fab fa-instagram" />
                <div>
                  <span className="info-label">Instagram</span>
                  <span className="info-value">@tilago</span>
                </div>
              </div>
              <div className="info-card">
                <i className="fas fa-clock" />
                <div>
                  <span className="info-label">أوقات الرد</span>
                  <span className="info-value">24/7</span>
                </div>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="input-group">
                  <i className="fas fa-user" />
                  <input type="text" placeholder="الاسم" required />
                </div>
                <div className="input-group">
                  <i className="fas fa-envelope" />
                  <input type="email" placeholder="البريد الإلكتروني" required />
                </div>
              </div>
              <div className="input-group">
                <i className="fas fa-comment-dots" />
                <textarea placeholder="رسالتك..." required />
              </div>
              <button type="submit">
                <i className="fas fa-paper-plane" />
                إرسال الرسالة
              </button>
            </form>
          </div>

          {formMsg && (
            <div className="form-toast">{formMsg}</div>
          )}
        </div>
      </section>

      <style>{`
        /* ── Palette ── */
        /* #7F3AA1  #5416B5  #0F083B  #0C0516  */

        /* ── Site-wide scroll reveal ── */
        [data-reveal] {
          opacity: 0;
          transition: opacity .75s ease, transform .75s cubic-bezier(.25,.8,.25,1);
        }
        [data-reveal="up"]    { transform: translateY(55px); }
        [data-reveal="down"]  { transform: translateY(-55px); }
        [data-reveal="left"]  { transform: translateX(-65px); }
        [data-reveal="right"] { transform: translateX(65px); }
        [data-reveal="scale"] { transform: scale(.82) translateY(20px); }
        [data-reveal="zoom"]  { transform: scale(.7); }
        [data-reveal].sr-in  { opacity: 1; transform: none; }
        [data-delay="1"] { transition-delay: .08s; }
        [data-delay="2"] { transition-delay: .18s; }
        [data-delay="3"] { transition-delay: .28s; }
        [data-delay="4"] { transition-delay: .38s; }
        [data-delay="5"] { transition-delay: .48s; }
        [data-delay="6"] { transition-delay: .58s; }

        /* ── Intro ── */
        .intro {
          position: fixed; top: 0; left: 0;
          width: 100%; height: 100%;
          background: #0C0516;
          display: flex; justify-content: center; align-items: center;
          z-index: 9999;
          animation: introFadeOut 1s ease 3s forwards;
        }
        .intro-logo {
          width: 250px;
          animation: zoomGlow 2.8s ease;
          transform-style: preserve-3d;
        }
        @keyframes zoomGlow {
          0%   { transform: scale(0.6) rotateY(35deg); opacity: 0; }
          50%  { transform: scale(1.2) rotateY(-10deg); opacity: 1; }
          100% { transform: scale(1) rotateY(0deg); opacity: 1; }
        }
        @keyframes introFadeOut { to { opacity: 0; visibility: hidden; } }

        /* ── Hero ── */
        .hero-section {
          width: 100%; margin-top: 20px; margin-bottom: 0;
          padding: 0 18px; position: relative;
        }
        .hero-container {
          max-width: 1400px; margin: 0 auto;
          border-radius: 28px; overflow: hidden;
          border: 1px solid rgba(127,58,161,0.18);
          height: clamp(200px, 42vw, 600px);
          box-shadow: 0 12px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(84,22,181,0.07);
        }
        .hero-image { width: 100%; height: 100%; }
        .hero-image img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center top;
          image-rendering: -webkit-optimize-contrast;
        }

        /* ── Platforms Strip ── */
        .platforms-section {
          padding: 28px 0 36px;
          text-align: center;
          border-bottom: 0.5px solid rgba(84,22,181,0.2);
          overflow: hidden;
        }
        .platforms-label {
          font-size: 0.75rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(196,160,224,0.45);
          margin-bottom: 18px;
          font-family:'Montserrat', sans-serif;
        }
        .platforms-track-wrap {
          overflow: hidden;
          mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent);
        }
        .platforms-track {
          display: flex;
          width: max-content;
          animation: platScroll 22s linear infinite;
        }
        .plat-item {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 32px;
          border-right: 0.5px solid rgba(84,22,181,0.2);
          white-space: nowrap;
        }
        .plat-item i {
          font-size: 1.1rem;
          color: rgba(196,160,224,0.55);
        }
        .plat-item span {
          font-size: 0.85rem;
          font-weight: 500;
          color: rgba(196,160,224,0.45);
          font-family:'Montserrat', sans-serif;
          letter-spacing: 1px;
        }
        .track-fwd { animation: platFwd 28s linear infinite; }
        .track-bwd { animation: platBwd 28s linear infinite; }
        @keyframes platFwd {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        @keyframes platBwd {
          from { transform: translateX(-33.333%); }
          to   { transform: translateX(0); }
        }

        /* ── Gallery Section (UNUSED - kept for ref) ── */
        .gallery-section {
          padding: 60px 40px;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 30px; max-width: 1600px; margin: 0 auto; width: 100%;
        }
        .gallery-container {
          position: relative; border-radius: 24px; overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,0.5);
          background: rgba(15,8,59,0.4);
          border: 2px solid rgba(84,22,181,0.35);
          transition: all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
          min-height: 550px;
        }
        .gallery-container.hovered {
          transform: translateY(-8px);
          border-color: #7F3AA1;
          box-shadow: 0 14px 40px rgba(84,22,181,0.3);
        }
        .gallery-slides { position: relative; width: 100%; height: 100%; overflow: hidden; }
        .gallery-slide {
          position: absolute; top: 0; left: 0;
          width: 100%; height: 100%;
          opacity: 0; transition: opacity 1s cubic-bezier(0.4,0,0.2,1);
        }
        .gallery-slide.active { opacity: 1; }
        .gallery-slide img {
          width: 100%; height: 100%; object-fit: cover;
          filter: brightness(0.75) saturate(1.1);
          transition: transform 0.8s ease;
        }
        .gallery-container.hovered .gallery-slide img {
          transform: scale(1.06);
          filter: brightness(0.85) saturate(1.15);
        }
        .gallery-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: #0F083B; border: 1px solid #5416B5;
          color: #fff; width: 50px; height: 50px; border-radius: 50%;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem; z-index: 10;
          transition: all 0.3s; opacity: 0;
        }
        .gallery-container.hovered .gallery-nav { opacity: 1; }
        .gallery-nav:hover { background: #5416B5; transform: translateY(-50%) scale(1.1); }
        .gallery-nav.prev { left: 20px; }
        .gallery-nav.next { right: 20px; }
        .gallery-dots {
          position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%);
          display: flex; gap: 10px; z-index: 10;
          padding: 8px 16px; background: rgba(12,5,22,0.85);
          border-radius: 30px;
          border: 1px solid rgba(84,22,181,0.3);
        }
        .dot {
          width: 12px; height: 12px; border-radius: 50%;
          background: rgba(255,255,255,0.2); border: 2px solid #5416B5;
          cursor: pointer; transition: all 0.3s;
        }
        .dot.active {
          background: #7F3AA1;
          transform: scale(1.3);
        }
        .gallery-title {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 40px 30px 30px;
          background: linear-gradient(to top, rgba(12,5,22,0.95), transparent);
          font-family:'Oxanium', sans-serif; font-size: 1.8rem; font-weight: 700;
          color: #c4a0e0;
          opacity: 0; transform: translateY(30px); transition: all 0.4s; z-index: 5;
        }
        .gallery-container.hovered .gallery-title { opacity: 1; transform: translateY(0); }
        .shop-now-btn {
          position: absolute; bottom: 30px; left: 50%;
          transform: translateX(-50%) translateY(20px);
          background: linear-gradient(135deg,#5416B5,#7F3AA1);
          color: #fff; padding: 13px 32px; border-radius: 30px;
          font-family:'Oxanium', sans-serif; font-size: 0.95rem; font-weight: 700;
          text-decoration: none; text-transform: uppercase; letter-spacing: 2px;
          box-shadow: 0 4px 18px rgba(84,22,181,0.4);
          opacity: 0; z-index: 10; transition: all 0.4s;
          border: 1px solid rgba(127,58,161,0.5);
        }
        .gallery-container.hovered .shop-now-btn { opacity: 1; transform: translateX(-50%) translateY(0); }
        .shop-now-btn:hover {
          transform: translateX(-50%) translateY(-3px);
          background: linear-gradient(135deg,#7F3AA1,#5416B5);
          box-shadow: 0 8px 24px rgba(84,22,181,0.5);
        }

        /* ── Services ── */
        .services-section {
          padding: 80px 24px;
          max-width: 1200px; margin: 0 auto; width: 100%;
        }
        .services-header {
          text-align: center; margin-bottom: 52px;
        }
        .services-tag {
          display: inline-block;
          font-family:'Cairo','29LtBukra','Montserrat', sans-serif; font-size: 0.65rem;
          font-weight: 700; letter-spacing: 4px; text-transform: uppercase;
          color: rgba(155,89,208,0.7); padding: 5px 20px; border-radius: 20px;
          border: 1px solid rgba(155,89,208,0.18);
          background: rgba(84,22,181,0.06);
          margin-bottom: 16px;
        }
        .services-header h2 {
          font-family:'Cairo','29LtBukra','Montserrat', sans-serif; font-size: clamp(1.7rem,3.5vw,2.4rem);
          color: #eae6ff; font-weight: 900; margin-bottom: 10px; letter-spacing: .5px;
        }
        .services-header p {
          font-family:'Cairo','29LtBukra','Montserrat', sans-serif; font-size: 0.92rem;
          color: rgba(170,160,205,0.4); line-height: 1.7;
        }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        .srv-card {
          display: flex; align-items: center; gap: 18px;
          padding: 24px 22px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(.25,.8,.25,1);
          position: relative; overflow: hidden;
        }
        .srv-card::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 0% 50%, rgba(84,22,181,0.08), transparent 70%);
          opacity: 0; transition: opacity 0.3s;
        }
        .srv-card:hover {
          background: rgba(84,22,181,0.07);
          border-color: rgba(155,89,208,0.28);
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(155,89,208,0.1);
        }
        .srv-card:hover::after { opacity: 1; }
        .srv-icon {
          width: 54px; height: 54px; flex-shrink: 0;
          border-radius: 15px;
          background: rgba(84,22,181,0.1);
          border: 1px solid rgba(84,22,181,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.35rem; color: rgba(155,89,208,0.6);
          transition: all 0.3s; position: relative; z-index: 1;
        }
        .srv-card:hover .srv-icon {
          background: rgba(84,22,181,0.22);
          border-color: rgba(155,89,208,0.45);
          color: #9B59D0; transform: scale(1.05);
        }
        .srv-body { flex: 1; position: relative; z-index: 1; }
        .srv-body h3 {
          font-family:'Cairo','29LtBukra','Montserrat', sans-serif; font-size: 0.98rem;
          color: #e8e2ff; font-weight: 800; margin-bottom: 4px;
        }
        .srv-body p {
          font-family:'Cairo','29LtBukra','Montserrat', sans-serif; font-size: 0.82rem;
          color: rgba(170,160,205,0.38); line-height: 1.5;
        }
        .srv-arrow {
          font-size: 0.75rem; color: rgba(155,89,208,0.22);
          transition: all 0.3s; flex-shrink: 0; position: relative; z-index: 1;
        }
        .srv-card:hover .srv-arrow {
          color: rgba(155,89,208,0.65); transform: translateX(-4px);
        }
        @media (max-width: 900px) {
          .services-grid { grid-template-columns: repeat(2,1fr); }
          .services-section { padding: 55px 16px; }
        }
        @media (max-width: 500px) {
          .services-grid { grid-template-columns: 1fr; }
        }

        /* ── Why Us ── */
        .why-section {
          width: 100%; padding: 80px 24px;
          background: rgba(8,2,18,0.6);
          border-top: 1px solid rgba(84,22,181,0.12);
          border-bottom: 1px solid rgba(84,22,181,0.12);
        }
        .why-container { max-width: 1100px; margin: 0 auto; }
        .why-header { text-align: center; margin-bottom: 52px; }
        .why-tag {
          display: inline-block;
          font-family:'Cairo','29LtBukra','Montserrat', sans-serif; font-size: 0.65rem;
          font-weight: 700; letter-spacing: 4px; text-transform: uppercase;
          color: rgba(155,89,208,0.7); padding: 5px 20px; border-radius: 20px;
          border: 1px solid rgba(155,89,208,0.18);
          background: rgba(84,22,181,0.06);
          margin-bottom: 16px; display: block; width: fit-content; margin: 0 auto 16px;
        }
        .why-header h2 {
          font-family:'Cairo','29LtBukra','Montserrat', sans-serif; font-size: clamp(1.6rem,3.5vw,2.3rem);
          color: #eae6ff; font-weight: 900; letter-spacing: .5px;
        }
        .why-grid {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 14px;
        }
        .why-card {
          padding: 34px 22px 30px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          text-align: center;
          transition: all 0.3s cubic-bezier(.25,.8,.25,1);
          position: relative; overflow: hidden;
        }
        .why-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(155,89,208,0.5), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .why-card:hover {
          border-color: rgba(155,89,208,0.25);
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.35), 0 0 0 1px rgba(155,89,208,0.1);
        }
        .why-card:hover::before { opacity: 1; }
        .why-icon-wrap {
          width: 58px; height: 58px; border-radius: 17px;
          background: rgba(84,22,181,0.1);
          border: 1px solid rgba(84,22,181,0.18);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 22px;
          font-size: 1.45rem; color: rgba(155,89,208,0.6);
          transition: all 0.3s;
        }
        .why-card:hover .why-icon-wrap {
          background: rgba(84,22,181,0.22);
          border-color: rgba(155,89,208,0.45);
          color: #9B59D0; transform: scale(1.08);
        }
        .why-card h3 {
          font-family:'Cairo','29LtBukra','Montserrat', sans-serif; font-size: 1rem;
          color: #e8e2ff; font-weight: 800; margin-bottom: 10px;
        }
        .why-card p {
          font-family:'Cairo','29LtBukra','Montserrat', sans-serif; font-size: 0.84rem;
          color: rgba(170,160,205,0.4); line-height: 1.75;
        }
        @media (max-width: 900px) {
          .why-grid { grid-template-columns: repeat(2,1fr); }
          .why-section { padding: 55px 16px; }
        }
        @media (max-width: 480px) {
          .why-grid { grid-template-columns: 1fr; }
        }

        /* ── Stats ── */
        .stats-section {
          width: 100%; padding: 55px 40px;
          background: rgba(15,8,59,0.4);
          border-top: 1px solid rgba(84,22,181,0.25);
          border-bottom: 1px solid rgba(84,22,181,0.25);
        }
        .stats-grid {
          max-width: 900px; margin: 0 auto;
          display: flex; align-items: center; justify-content: center;
        }
        .stat-item {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; gap: 10px;
        }
        .stat-number {
          font-family:'Oxanium', sans-serif; font-size: 2.6rem;
          font-weight: 900; color: #c4a0e0; letter-spacing: 2px;
        }
        .stat-label {
          font-family:'Cairo','Cairo','29LtBukra','Montserrat', sans-serif; font-size: 1rem;
          color: rgba(255,255,255,0.55); letter-spacing: 1px;
          text-transform: uppercase; font-weight: 600;
        }
        .stat-divider {
          width: 1px; height: 60px; flex-shrink: 0;
          background: linear-gradient(180deg, transparent, rgba(84,22,181,0.5), transparent);
        }
        @media (max-width: 600px) {
          .stats-grid { flex-wrap: wrap; gap: 30px; }
          .stat-divider { display: none; }
          .stat-number { font-size: 2rem; }
        }

        /* ── Contact ── */
        #contact {
          padding: 80px 40px;
          background: linear-gradient(180deg,#0C0516,#0F083B);
          position: relative;
          border-top: 1px solid rgba(84,22,181,0.25);
        }
        .contact-container { max-width: 1200px; margin: 0 auto; }
        .contact-header { text-align: center; margin-bottom: 55px; }
        .contact-tag {
          display: inline-block;
          font-family:'Montserrat', sans-serif; font-size: 0.85rem;
          font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
          color: #7F3AA1; margin-bottom: 14px;
          padding: 5px 18px; border-radius: 20px;
          border: 1px solid rgba(127,58,161,0.4);
          background: rgba(84,22,181,0.1);
        }
        .contact-header h2 {
          font-family:'Oxanium', sans-serif; font-size: 2.4rem;
          color: #fff; letter-spacing: 2px; margin-bottom: 14px;
        }
        .contact-sub {
          font-family:'Montserrat', sans-serif; font-size: 1.05rem;
          color: rgba(255,255,255,0.5); letter-spacing: 0.5px;
        }
        .contact-body {
          display: grid; grid-template-columns: 1fr 1.6fr; gap: 40px;
          align-items: start;
        }
        .contact-info { display: flex; flex-direction: column; gap: 16px; }
        .info-card {
          display: flex; align-items: center; gap: 18px;
          padding: 18px 22px; border-radius: 14px;
          background: rgba(15,8,59,0.5);
          border: 1px solid rgba(84,22,181,0.3);
          transition: border-color 0.3s;
        }
        .info-card:hover { border-color: #7F3AA1; }
        .info-card > i {
          font-size: 1.3rem; color: #7F3AA1;
          width: 42px; height: 42px; display: flex;
          align-items: center; justify-content: center;
          border-radius: 10px; background: rgba(84,22,181,0.15);
          flex-shrink: 0;
        }
        .info-label {
          display: block; font-family:'Montserrat', sans-serif;
          font-size: 0.78rem; color: rgba(255,255,255,0.4);
          letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 3px;
        }
        .info-value {
          display: block; font-family:'Montserrat', sans-serif;
          font-size: 1rem; color: rgba(255,255,255,0.85); font-weight: 600;
        }
        .contact-form { display: flex; flex-direction: column; gap: 14px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .input-group {
          position: relative; display: flex; align-items: center;
        }
        .input-group > i {
          position: absolute; right: 16px;
          color: rgba(127,58,161,0.6); font-size: 0.9rem; pointer-events: none;
        }
        .input-group input,
        .input-group textarea {
          width: 100%; padding: 14px 42px 14px 18px;
          border: 1px solid rgba(84,22,181,0.35); border-radius: 12px;
          background: rgba(15,8,59,0.55); color: #fff;
          font-size: 0.95rem; font-family:'Montserrat', sans-serif;
          outline: none; transition: all 0.25s;
        }
        .input-group input::placeholder,
        .input-group textarea::placeholder { color: rgba(255,255,255,0.3); }
        .input-group input:focus,
        .input-group textarea:focus {
          border-color: #7F3AA1;
          background: rgba(15,8,59,0.8);
        }
        .input-group textarea { height: 130px; resize: none; align-items: flex-start; padding-top: 14px; }
        .input-group:has(textarea) > i { top: 16px; align-self: flex-start; }
        .contact-form button {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          background: linear-gradient(135deg,#5416B5,#7F3AA1);
          color: #fff; padding: 15px; border: none; border-radius: 12px;
          font-size: 1rem; font-weight: 700;
          font-family:'Oxanium', sans-serif; cursor: pointer;
          transition: all 0.3s; letter-spacing: 1.5px;
        }
        .contact-form button:hover { opacity: 0.9; transform: translateY(-2px); }
        .form-toast {
          position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
          background: linear-gradient(135deg,#5416B5,#7F3AA1);
          color: #fff; padding: 14px 32px; border-radius: 30px;
          font-family:'Montserrat', sans-serif; font-size: 1rem; font-weight: 600;
          z-index: 9999; letter-spacing: 1px;
        }
        @media (max-width: 768px) {
          .contact-body { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
          .contact-header h2 { font-size: 1.8rem; }
          #contact { padding: 60px 20px; }
        }

        /* ── Ticker Bar ── */
        .ticker-section {
          width: 100%;
          margin-top: 18px; margin-bottom: 18px;
          position: relative;
        }
        .ticker-section::before,
        .ticker-section::after {
          content: '';
          position: absolute; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #5416B5 20%, #7F3AA1 50%, #5416B5 80%, transparent);
        }
        .ticker-section::before { top: 0; }
        .ticker-section::after  { bottom: 0; }
        .ticker-bar {
          width: 100%;
          position: relative; height: 36px;
          overflow: hidden;
          background: linear-gradient(90deg, #0C0516, rgba(84,22,181,0.08) 50%, #0C0516);
        }
        .ticker-fade {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg,#0C0516 0%,transparent 5%,transparent 95%,#0C0516 100%);
          z-index: 3; pointer-events: none;
        }
        .ticker-track {
          display: flex; align-items: center; height: 100%;
          gap: 0; white-space: nowrap; width: max-content;
          animation: tickerScroll 28s linear infinite;
          will-change: transform;
        }
        .ticker-bar:hover .ticker-track { animation-play-state: paused; }
        .ticker-item {
          display: inline-flex; align-items: center; gap: 7px;
          font-family:'Montserrat', sans-serif; font-size: 0.78rem;
          font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          padding: 0 28px;
        }
        .ticker-item i { color: #7F3AA1; font-size: 0.72rem; }
        .ticker-sep {
          color: #5416B5; font-size: 0.5rem; opacity: 0.5;
          display: inline-flex; align-items: center;
        }
        @keyframes tickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ── Quick Nav ── */
        .quick-nav-section {
          max-width: 1100px; margin: 0 auto; padding: 16px 20px 32px;
        }
        .quick-nav-grid {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 14px;
        }
        .quick-nav-btn {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px; padding: 18px 12px 16px;
          border-radius: 20px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(175,165,208,0.5);
          font-family:'Cairo','29LtBukra','Montserrat', sans-serif; font-size: 0.95rem;
          font-weight: 700; text-decoration: none;
          position: relative; overflow: hidden;
          transition: all 0.3s cubic-bezier(.25,.8,.25,1);
        }
        .quick-nav-btn::before {
          content: '';position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(84,22,181,0.13), transparent 70%);
          opacity: 0; transition: opacity 0.3s;
        }
        .quick-nav-btn:hover::before { opacity: 1; }
        .quick-nav-icon {
          width: 54px; height: 54px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(84,22,181,0.1);
          border: 1px solid rgba(84,22,181,0.18);
          font-size: 1.45rem; color: rgba(155,89,208,0.55);
          transition: all 0.3s; flex-shrink: 0;
        }
        .quick-nav-btn:hover {
          background: rgba(84,22,181,0.07);
          border-color: rgba(155,89,208,0.28);
          color: #e2dcff;
          transform: translateY(-5px);
          box-shadow: 0 14px 36px rgba(84,22,181,0.18);
        }
        .quick-nav-btn:hover .quick-nav-icon {
          background: rgba(84,22,181,0.22);
          border-color: rgba(155,89,208,0.45);
          color: #9B59D0;
          transform: scale(1.08);
        }
        @media (max-width: 768px) {
          .quick-nav-section { padding: 24px 16px 36px; }
          .quick-nav-grid { gap: 10px; }
          .quick-nav-btn { padding: 22px 8px 18px; gap: 10px; border-radius: 16px; font-size: .85rem; }
          .quick-nav-icon { width: 44px; height: 44px; font-size: 1.2rem; }
        }
        @media (max-width: 480px) {
          .quick-nav-btn { padding: 18px 6px 14px; gap: 8px; font-size: .78rem; }
          .quick-nav-icon { width: 38px; height: 38px; font-size: 1rem; }
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .hero-container { border-radius: 20px; }
          .gallery-section { grid-template-columns: 1fr; padding: 40px 20px; }
          .services-grid { grid-template-columns: repeat(2,1fr); }
          .why-grid { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 768px) {
          .hero-section { margin-top: 12px; padding: 0 8px; }
          .hero-container { border-radius: 16px; border-width: 2px; }
          .quick-nav-section { padding: 0 8px; margin-bottom: 28px; }
          .quick-nav-grid { grid-template-columns: repeat(2,1fr); gap: 10px; }
          .quick-nav-btn { padding: 12px 10px; font-size: .8rem; border-radius: 12px; }
          .services-section { padding: 50px 20px; }
          .services-header h2 { font-size: 1.5rem; }
          .services-grid { grid-template-columns: repeat(2,1fr); gap: 12px; }
          .why-section { padding: 50px 20px; }
          .why-grid { grid-template-columns: repeat(2,1fr); gap: 14px; }
          .why-header h2 { font-size: 1.5rem; }
          .stats-section { padding: 35px 20px; }
          .stats-grid { flex-wrap: wrap; gap: 24px; }
          .stat-divider { display: none; }
          .stat-number { font-size: 2rem; }
          .contact-body { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
          .contact-header h2 { font-size: 1.8rem; }
          #contact { padding: 50px 20px; }
        }
        @media (max-width: 560px) {
          .hero-container { border-radius: 12px; }
          .quick-nav-grid { grid-template-columns: repeat(2,1fr); gap: 8px; }
          .quick-nav-btn { padding: 11px 8px; font-size: .75rem; }
          .services-grid { grid-template-columns: 1fr; }
          .why-grid { grid-template-columns: 1fr; }
          .why-card { padding: 22px 18px; }
          .stat-number { font-size: 1.8rem; }
          .platforms-section { padding: 18px 0 24px; }
        }
        @media (max-width: 360px) {
          .hero-container { border-radius: 10px; }
          .quick-nav-btn { font-size: .68rem; padding: 10px 6px; }
        }
        @media (min-width: 1600px) {
          .hero-section { padding: 0 clamp(20px, 3vw, 60px); }
          .services-section { max-width: 1400px; }
        }
        @media (hover: none) {
          .quick-nav-btn:hover { transform: none; box-shadow: none; }
          .srv-card:hover { transform: none; }
          .why-card:hover { transform: none; }
          .quick-nav-btn:active { background: rgba(84,22,181,0.25); border-color: #7F3AA1; }
        }
      `}</style>
    </>
  );
}

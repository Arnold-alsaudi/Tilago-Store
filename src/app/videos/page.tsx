'use client';

import { useState, useEffect, useRef } from 'react';

/* ─── Data ─────────────────────────────────────────────────── */
type VideoProduct = {
  id: string; name: string; desc: string;
  thumb: string; video: string;
};

const PRODUCTS: VideoProduct[] = [
  { id:'v1', name:'Venom Intro',     desc:'إنترو فينوم احترافي يفتح بثك بدراما سينمائية مذهلة',         thumb:'/photo/venom-1.png',  video:'/video/tilago.mp4' },
  { id:'v2', name:'Anime Stream',    desc:'تصميم أنيمي حصري مناسب لعشاق الأنمي والبث الياباني',         thumb:'/photo/anime.png',    video:'/video/tilago.mp4' },
  { id:'v3', name:'Epic Overlay',    desc:'أوفرلاي ملحمي بتأثيرات بصرية تجعل بثك استثنائياً',          thumb:'/photo/venom-2.png',  video:'/video/tilago.mp4' },
  { id:'v4', name:'Venom Scene',     desc:'مشهد فينوم كامل بجودة سينمائية عالية الدقة',                 thumb:'/photo/venom-5.png',  video:'/video/tilago.mp4' },
  { id:'v5', name:'Alert Pack',      desc:'باكدج اليرتات متكامل بتصميم موحد ومميز لقناتك',             thumb:'/photo/alert-3d.png', video:'/video/tilago.mp4' },
  { id:'v6', name:'Cyber Intro',     desc:'إنترو سيبراني من المستقبل بتقنيات بصرية متقدمة',             thumb:'/photo/venom-7.png',  video:'/video/tilago.mp4' },
  { id:'v7', name:'Special Alert',   desc:'اليرت خاص مميز يجعل كل تنبيه حدثاً لا يُنسى',              thumb:'/photo/alert-special.png', video:'/video/tilago.mp4' },
  { id:'v8', name:'Follow Burst',    desc:'تأثير متابعة احترافي يعطي جمهورك تجربة بصرية رائعة',        thumb:'/photo/venom-9.png',  video:'/video/tilago.mp4' },
  { id:'v9', name:'Galaxy Stream',   desc:'تصميم كوني شامل يحوّل بثك إلى تجربة فضائية ساحرة',         thumb:'/photo/venom-10.png', video:'/video/tilago.mp4' },
];

const CONTACT_BTNS = [
  { icon:'fab fa-whatsapp', label:'واتساب',       href:'https://wa.me/1234567890',      color:'#25D366' },
  { icon:'fab fa-telegram', label:'تيليجرام',     href:'https://t.me/yourchannel',      color:'#0088cc' },
  { icon:'fab fa-discord',  label:'ديسكورد',      href:'https://discord.gg/yourserver', color:'#5865F2' },
  { icon:'fas fa-headset',  label:'خدمة العملاء', href:'mailto:support@tilago.com',     color:'#7F3AA1' },
];

const FEATURES = [
  { icon:'fas fa-video',       title:'جودة عالية',    desc:'فيديوهات بجودة 4K جاهزة للبث المباشر' },
  { icon:'fas fa-bolt',        title:'تسليم سريع',    desc:'تسليم مشروعك في أقل من 24 ساعة' },
  { icon:'fas fa-paint-brush', title:'تخصيص كامل',    desc:'كل تصميم قابل للتعديل والتخصيص الكامل' },
  { icon:'fas fa-headset',     title:'دعم مستمر',     desc:'فريقنا متاح على مدار الساعة لخدمتك' },
];

/* ─── Component ─────────────────────────────────────────────── */
export default function VideosPage() {
  const [modal, setModal] = useState<VideoProduct | null>(null);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add('sr-in'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!modal) { setPlaying(false); return; }
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setModal(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modal]);

  const openModal = (p: VideoProduct) => { setModal(p); setPlaying(false); };

  return (
    <div className="vp" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Cairo:wght@400;600;700;900&display=swap');

        .vp { background:linear-gradient(180deg,#0F083B,#0C0516); min-height:100vh; font-family:'Cairo',sans-serif; color:#fff; }

        /* ── HERO ── */
        .vp-hero { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-around; padding:4rem 5%; gap:2rem; }
        .vp-hero-videos { display:flex; gap:1rem; justify-content:center; flex-wrap:nowrap; }
        .vp-hero-vid { width:300px; flex-shrink:0; border-radius:14px; overflow:hidden; border:1px solid rgba(84,22,181,0.35); box-shadow:0 4px 28px rgba(0,0,0,0.55); }
        .vp-hero-vid video { width:100%; display:block; }
        .vp-hero-content { flex:1; min-width:280px; max-width:520px; text-align:right; }
        .vp-hero-tag { display:inline-flex; align-items:center; gap:8px; background:rgba(84,22,181,0.15); border:1px solid rgba(84,22,181,0.35); border-radius:50px; padding:.45rem 1.2rem; font-size:.85rem; color:#9B59D0; margin-bottom:1.2rem; }
        .vp-hero-content h1 { font-family:'Cairo',sans-serif; font-size:clamp(1.9rem,3.5vw,2.7rem); font-weight:900; line-height:1.25; margin-bottom:.8rem; }
        .vp-hero-content h1 span { background:linear-gradient(135deg,#9B59D0,#5416B5); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .vp-hero-divider { width:40px; height:2px; background:linear-gradient(90deg,#5416B5,rgba(84,22,181,0)); margin-bottom:1.2rem; }
        .vp-hero-content p { color:rgba(255,255,255,0.7); font-size:1rem; line-height:1.8; margin-bottom:1.6rem; }
        .vp-hero-cta { display:inline-flex; align-items:center; gap:10px; padding:.9rem 2.2rem; border-radius:50px; background:linear-gradient(135deg,#5416B5,#7F3AA1); color:#fff; font-family:'Cairo',sans-serif; font-size:1rem; font-weight:700; text-decoration:none; transition:transform .2s,box-shadow .2s; }
        .vp-hero-cta:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(84,22,181,0.5); }

        /* ── STATS ── */
        .vp-stats { display:flex; justify-content:center; padding:1.4rem 5%; border-top:1px solid rgba(84,22,181,0.12); border-bottom:1px solid rgba(84,22,181,0.12); background:rgba(15,8,59,0.4); flex-wrap:wrap; }
        .vp-stat { flex:1; min-width:110px; text-align:center; padding:.8rem 1.5rem; border-left:1px solid rgba(84,22,181,0.2); }
        .vp-stat:last-child { border-left:none; }
        .vp-stat-num { font-family:'Orbitron',sans-serif; font-size:1.5rem; font-weight:700; background:linear-gradient(135deg,#9B59D0,#5416B5); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .vp-stat-label { font-size:.8rem; color:rgba(255,255,255,0.55); margin-top:2px; }

        /* ── GRID ── */
        .vp-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1.4rem; padding:2rem 5% 3rem; }

        /* ── CARD ── */
        .vp-card { background:rgba(15,8,59,0.5); border:1px solid rgba(84,22,181,0.12); border-radius:16px; overflow:hidden; cursor:pointer; transition:transform .28s,border-color .28s,box-shadow .28s; position:relative; }
        .vp-card:hover { transform:translateY(-6px); border-color:rgba(84,22,181,0.5); box-shadow:0 12px 36px rgba(84,22,181,0.25); }
        .vp-card-thumb { position:relative; width:100%; height:190px; overflow:hidden; }
        .vp-card-thumb img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .4s; }
        .vp-card:hover .vp-card-thumb img { transform:scale(1.06); }
        .vp-card-play { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.35); opacity:0; transition:opacity .25s; }
        .vp-card:hover .vp-card-play { opacity:1; }
        .vp-card-play-icon { width:54px; height:54px; border-radius:50%; background:linear-gradient(135deg,#5416B5,#7F3AA1); display:flex; align-items:center; justify-content:center; font-size:1.2rem; box-shadow:0 6px 24px rgba(84,22,181,0.5); }
        .vp-card-body { padding:1rem 1.1rem 1.2rem; }
        .vp-card-name { font-family:'Cairo',sans-serif; font-size:1rem; font-weight:700; color:#fff; margin-bottom:.35rem; }
        .vp-card-desc { font-size:.82rem; color:rgba(255,255,255,0.5); line-height:1.6; }

        /* ── FEATURES ── */
        .vp-features { padding:3rem 5%; border-top:1px solid rgba(84,22,181,0.15); border-bottom:1px solid rgba(84,22,181,0.15); background:linear-gradient(180deg,#0C0516,#0F083B); }
        .vp-features-title { text-align:center; font-family:'Cairo',sans-serif; font-size:1.6rem; font-weight:900; margin-bottom:.5rem; }
        .vp-features-title span { background:linear-gradient(135deg,#9B59D0,#5416B5); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .vp-features-sub { text-align:center; color:rgba(255,255,255,0.5); font-size:.9rem; margin-bottom:2rem; }
        .vp-features-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1.2rem; }
        .vp-feat-card { background:rgba(15,8,59,0.5); border:1px solid rgba(84,22,181,0.12); border-radius:12px; padding:1.4rem 1.2rem; text-align:center; transition:border-color .25s; }
        .vp-feat-card:hover { border-color:rgba(84,22,181,0.4); }
        .vp-feat-icon { width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg,rgba(84,22,181,0.25),rgba(127,58,161,0.15)); display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; font-size:1.2rem; color:#9B59D0; }
        .vp-feat-card h4 { font-family:'Cairo',sans-serif; font-size:.95rem; font-weight:700; margin-bottom:.5rem; }
        .vp-feat-card p { font-size:.8rem; color:rgba(255,255,255,0.5); line-height:1.6; }

        /* ── CONTACTS ── */
        .vp-contacts { padding:2.5rem 5%; text-align:center; }
        .vp-contacts h3 { font-family:'Cairo',sans-serif; font-size:1.3rem; font-weight:900; margin-bottom:.5rem; }
        .vp-contacts p { color:rgba(255,255,255,0.5); font-size:.9rem; margin-bottom:1.5rem; }
        .vp-contact-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:.8rem; max-width:680px; margin:0 auto; }
        .vp-contact-btn { display:flex; align-items:center; justify-content:center; gap:9px; padding:.85rem 1rem; border-radius:10px; background:rgba(15,8,59,0.6); border:1px solid rgba(84,22,181,0.2); color:#fff; font-family:'Cairo',sans-serif; font-size:.9rem; font-weight:600; text-decoration:none; transition:all .25s; }
        .vp-contact-btn:hover { border-color:#5416B5; background:rgba(84,22,181,0.15); transform:translateY(-2px); }

        /* ── MODAL ── */
        .vp-modal-bg { position:fixed; inset:0; background:rgba(0,0,0,0.92); backdrop-filter:blur(14px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:1.5rem; }
        .vp-modal {
          background:linear-gradient(160deg,#0F083B,#0C0516);
          border:1px solid rgba(84,22,181,0.35);
          border-radius:20px;
          width:min(96vw,860px);
          max-height:92vh;
          overflow:hidden;
          display:flex;
          flex-direction:column;
          box-shadow:0 40px 100px rgba(0,0,0,0.85);
        }
        .vp-modal-header { display:flex; align-items:center; justify-content:space-between; padding:1.2rem 1.6rem; border-bottom:1px solid rgba(84,22,181,0.12); }
        .vp-modal-header h2 { font-family:'Cairo',sans-serif; font-size:1.3rem; font-weight:900; background:linear-gradient(135deg,#fff,#9B59D0); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .vp-modal-close { background:rgba(84,22,181,0.2); border:1px solid rgba(84,22,181,0.3); color:#fff; width:36px; height:36px; border-radius:50%; font-size:1.2rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .2s; }
        .vp-modal-close:hover { background:rgba(84,22,181,0.6); transform:rotate(90deg); }

        /* video area */
        .vp-modal-video { position:relative; background:#000; }
        .vp-modal-video video { width:100%; display:block; max-height:65vh; object-fit:contain; }
        .vp-modal-thumb { width:100%; max-height:65vh; object-fit:cover; display:block; }
        .vp-modal-play-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; cursor:pointer; }
        .vp-modal-play-btn { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,#5416B5,#7F3AA1); display:flex; align-items:center; justify-content:center; font-size:1.6rem; box-shadow:0 8px 32px rgba(84,22,181,0.6); transition:transform .2s; }
        .vp-modal-play-btn:hover { transform:scale(1.1); }

        /* modal footer */
        .vp-modal-footer { display:flex; align-items:center; justify-content:space-between; padding:1rem 1.6rem; border-top:1px solid rgba(84,22,181,0.1); flex-wrap:wrap; gap:.8rem; }
        .vp-modal-desc { color:rgba(255,255,255,0.6); font-size:.88rem; flex:1; }
        .vp-modal-actions { display:flex; gap:.6rem; flex-wrap:wrap; }
        .vp-modal-actions a { display:flex; align-items:center; gap:7px; padding:.6rem 1.1rem; border-radius:9px; font-family:'Cairo',sans-serif; font-size:.85rem; font-weight:700; text-decoration:none; transition:all .2s; background:rgba(15,8,59,0.6); border:1px solid rgba(84,22,181,0.2); color:#fff; }
        .vp-modal-actions a:first-child { background:linear-gradient(135deg,#5416B5,#7F3AA1); border:none; box-shadow:0 3px 14px rgba(84,22,181,0.35); }
        .vp-modal-actions a:hover { transform:translateY(-1px); border-color:#7F3AA1; }

        /* reveal */
        [data-reveal] { opacity:0; transition:opacity .75s ease,transform .75s cubic-bezier(.25,.8,.25,1); }
        [data-reveal="up"]    { transform:translateY(50px); }
        [data-reveal="left"]  { transform:translateX(-55px); }
        [data-reveal="right"] { transform:translateX(55px); }
        [data-reveal="scale"] { transform:scale(.85) translateY(18px); }
        [data-reveal].sr-in  { opacity:1; transform:none; }
        [data-delay="1"]{transition-delay:.06s}[data-delay="2"]{transition-delay:.12s}[data-delay="3"]{transition-delay:.18s}
        [data-delay="4"]{transition-delay:.24s}[data-delay="5"]{transition-delay:.30s}[data-delay="6"]{transition-delay:.36s}

        @media(max-width:700px){
          .vp-hero-videos { flex-wrap:wrap; }
          .vp-hero-vid { width:100%; }
          .vp-modal-footer { flex-direction:column; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="vp-hero">
        <div className="vp-hero-videos" data-reveal="left">
          {[1,2,3].map(i => (
            <div key={i} className="vp-hero-vid">
              <video autoPlay muted loop playsInline>
                <source src="/video/tilago.mp4" type="video/mp4" />
              </video>
            </div>
          ))}
        </div>
        <div className="vp-hero-content" data-reveal="right">
          <div className="vp-hero-tag"><i className="fas fa-video" /> Video Packages</div>
          <h1>أفضل <span>فيديوهات البث</span> من Tilago</h1>
          <div className="vp-hero-divider" />
          <p>فيديوهات احترافية جاهزة للبث المباشر مصممة بأعلى مستوى من الجودة لتميزك عن الجميع</p>
          <a href="#grid" className="vp-hero-cta">تصفح الفيديوهات <i className="fas fa-arrow-left" /></a>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="vp-stats" data-reveal="up">
        {[
          { num:'9',    label:'فيديو جاهز' },
          { num:'4K',   label:'جودة الفيديو' },
          { num:'24h',  label:'وقت التسليم' },
          { num:'100%', label:'جودة مضمونة' },
        ].map(s => (
          <div className="vp-stat" key={s.label}>
            <div className="vp-stat-num">{s.num}</div>
            <div className="vp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── GRID ── */}
      <div className="vp-grid" id="grid">
        {PRODUCTS.map((p, i) => (
          <div
            key={p.id}
            className="vp-card"
            data-reveal="scale"
            data-delay={String((i % 6) + 1) as any}
            onClick={() => openModal(p)}
          >
            <div className="vp-card-thumb">
              <img src={p.thumb} alt={p.name} loading="lazy" />
              <div className="vp-card-play">
                <div className="vp-card-play-icon"><i className="fas fa-play" /></div>
              </div>
            </div>
            <div className="vp-card-body">
              <div className="vp-card-name">{p.name}</div>
              <div className="vp-card-desc">{p.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <section className="vp-features">
        <h2 className="vp-features-title" data-reveal="up">لماذا تختار <span>Tilago Videos</span>؟</h2>
        <p className="vp-features-sub" data-reveal="up">كل ما تحتاجه لبث احترافي في مكان واحد</p>
        <div className="vp-features-grid">
          {FEATURES.map((f, i) => (
            <div className="vp-feat-card" key={f.title} data-reveal="up" data-delay={String(i + 1) as any}>
              <div className="vp-feat-icon"><i className={f.icon} /></div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACTS ── */}
      <section className="vp-contacts" data-reveal="up">
        <h3>تواصل معنا الآن</h3>
        <p>اطلب فيديوهك واحصل عليه بأسرع وقت</p>
        <div className="vp-contact-grid">
          {CONTACT_BTNS.map(b => (
            <a key={b.label} href={b.href} target="_blank" rel="noreferrer" className="vp-contact-btn">
              <i className={b.icon} style={{ color: b.color }} /> {b.label}
            </a>
          ))}
        </div>
      </section>

      {/* ── MODAL ── */}
      {modal && (
        <div className="vp-modal-bg" onClick={() => setModal(null)}>
          <div className="vp-modal" onClick={e => e.stopPropagation()}>
            {/* header */}
            <div className="vp-modal-header">
              <h2>{modal.name}</h2>
              <button className="vp-modal-close" onClick={() => setModal(null)}>×</button>
            </div>

            {/* video / thumb */}
            <div className="vp-modal-video">
              {playing ? (
                <video ref={videoRef} controls autoPlay style={{ width:'100%', maxHeight:'65vh', objectFit:'contain', display:'block', background:'#000' }}>
                  <source src={modal.video} type="video/mp4" />
                </video>
              ) : (
                <>
                  <img className="vp-modal-thumb" src={modal.thumb} alt={modal.name} />
                  <div className="vp-modal-play-overlay" onClick={() => setPlaying(true)}>
                    <div className="vp-modal-play-btn"><i className="fas fa-play" /></div>
                  </div>
                </>
              )}
            </div>

            {/* footer */}
            <div className="vp-modal-footer">
              <p className="vp-modal-desc">{modal.desc}</p>
              <div className="vp-modal-actions">
                <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer">
                  <i className="fab fa-whatsapp" /> اطلب الآن
                </a>
                <a href="https://t.me/yourchannel" target="_blank" rel="noreferrer">
                  <i className="fab fa-telegram" /> تيليجرام
                </a>
                <a href="https://discord.gg/yourserver" target="_blank" rel="noreferrer">
                  <i className="fab fa-discord" /> ديسكورد
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

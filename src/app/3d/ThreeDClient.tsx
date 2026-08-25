'use client';

import { useState, useEffect, useRef } from 'react';
import { youtubeEmbedUrl } from '@/lib/youtube';
import { mediaKind, videoPoster } from '@/lib/media';

/* ─── Types ─────────────────────────────────────────────────── */
export interface TDProduct {
  id: string; name: string; desc: string; cat: string;
  badge?: string; cover: string; media: string[];
}


const CONTACT_BTNS = [
  { icon: 'fab fa-whatsapp', label: 'واتساب',       href: 'https://wa.me/1234567890',      color: '#25D366' },
  { icon: 'fab fa-telegram', label: 'تيليجرام',     href: 'https://t.me/yourchannel',      color: '#0088cc' },
  { icon: 'fab fa-discord',  label: 'ديسكورد',      href: 'https://discord.gg/yourserver', color: '#5865F2' },
  { icon: 'fas fa-headset',  label: 'خدمة العملاء', href: 'mailto:support@tilago.com',     color: '#7F3AA1' },
];

const FEATURES = [
  { icon: 'fas fa-cube',        title: 'جودة سينمائية', desc: 'تأثيرات ثلاثية الأبعاد بجودة احترافية تليق بكبار البثاثين' },
  { icon: 'fas fa-bolt',        title: 'تسليم سريع',    desc: 'نسلمك مشروعك في أقصر وقت ممكن دون أي تنازل عن الجودة' },
  { icon: 'fas fa-paint-brush', title: 'تخصيص كامل',    desc: 'كل تأثير قابل للتخصيص الكامل ليناسب هويتك البصرية' },
  { icon: 'fas fa-headset',     title: 'دعم مستمر',     desc: 'فريقنا متاح لدعمك وتعديل أي شيء حتى تحصل على المثالية' },
];

/* ─── Component ─────────────────────────────────────────────── */
type ModalState = { product: TDProduct; imgIdx: number } | null;

export default function ThreeDClient({ products }: { products: TDProduct[] }) {
  const [modal, setModal]         = useState<ModalState>(null);
  const revRef                    = useRef<HTMLDivElement>(null);

  /* scroll reveal */
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add('sr-in'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [products.length]);

  /* keyboard nav in modal */
  useEffect(() => {
    if (!modal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModal(null);
      if (e.key === 'ArrowLeft')  setModal(m => m ? { ...m, imgIdx: (m.imgIdx + 1) % m.product.media.length } : m);
      if (e.key === 'ArrowRight') setModal(m => m ? { ...m, imgIdx: (m.imgIdx - 1 + m.product.media.length) % m.product.media.length } : m);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modal]);

  return (
    <div className="tdp" dir="rtl" ref={revRef}>
      <style>{`
        .tdp { background:linear-gradient(180deg,#0F083B,#0C0516); min-height:100vh; font-family:'29LtBukra','Montserrat',sans-serif; color:#fff; overflow-x:hidden; }
        .tdp-hero { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-around; padding:4rem 5%; gap:2rem; }
        .tdp-hero-videos { display:flex; gap:1rem; justify-content:center; flex-wrap:nowrap; }
        .tdp-hero-vid { width:320px; flex-shrink:0; border-radius:14px; overflow:hidden; border:1px solid rgba(84,22,181,0.35); box-shadow:0 4px 28px rgba(0,0,0,0.55); }
        .tdp-hero-vid video { width:100%; display:block; }
        .tdp-hero-content { flex:1; min-width:280px; max-width:540px; text-align:right; }
        .tdp-hero-tag { display:inline-flex; align-items:center; gap:8px; background:rgba(84,22,181,0.15); border:1px solid rgba(84,22,181,0.35); border-radius:50px; padding:.45rem 1.2rem; font-size:.85rem; color:#9B59D0; margin-bottom:1.2rem; }
        .tdp-hero-content h1 { font-family:'29LtBukra','Montserrat',sans-serif; font-size:clamp(1.9rem,3.5vw,2.7rem); font-weight:900; line-height:1.25; margin-bottom:.8rem; }
        .tdp-hero-content h1 span { background:linear-gradient(135deg,#9B59D0,#5416B5); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .tdp-hero-divider { width:40px; height:2px; background:linear-gradient(90deg,#5416B5,rgba(84,22,181,0)); margin-bottom:1.2rem; }
        .tdp-hero-content p { color:rgba(255,255,255,0.7); font-size:1rem; line-height:1.8; margin-bottom:1.6rem; }
        .tdp-hero-cta { display:inline-flex; align-items:center; gap:10px; padding:.9rem 2.2rem; border-radius:50px; background:linear-gradient(135deg,#5416B5,#7F3AA1); color:#fff; font-family:'29LtBukra','Montserrat',sans-serif; font-size:1rem; font-weight:700; text-decoration:none; transition:transform .2s,box-shadow .2s; }
        .tdp-hero-cta:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(84,22,181,0.5); }
        @media(max-width:1024px){
          .tdp-hero { flex-direction:column-reverse; text-align:right; padding:3rem 6% 2.5rem; gap:1.6rem; }
          .tdp-hero-content { max-width:100%; width:100%; text-align:right; }
          .tdp-hero-videos { width:100%; justify-content:center; flex-wrap:wrap; }
          .tdp-hero-vid { width:100%; max-width:420px; }
          .tdp-hero-vid:nth-child(n+2){ display:none; }
          /* على الموبايل: أنيميشن ظهور رأسي بدل أفقي عشان النص ما يتزحلقش بره الشاشة */
          .tdp-hero-content[data-reveal], .tdp-hero-videos[data-reveal] { transform:translateY(28px); }
          .tdp-hero-content[data-reveal].sr-in, .tdp-hero-videos[data-reveal].sr-in { transform:none; }
        }
        .tdp-stats { display:flex; justify-content:center; gap:0; padding:1.4rem 5%; border-top:1px solid rgba(84,22,181,0.12); border-bottom:1px solid rgba(84,22,181,0.12); background:rgba(15,8,59,0.4); flex-wrap:wrap; }
        .tdp-stat { flex:1; min-width:120px; text-align:center; padding:.8rem 1.5rem; border-left:1px solid rgba(84,22,181,0.2); }
        .tdp-stat:last-child { border-left:none; }
        .tdp-stat-num { font-family:'Oxanium',sans-serif; font-size:1.5rem; font-weight:700; background:linear-gradient(135deg,#9B59D0,#5416B5); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .tdp-stat-label { font-size:.8rem; color:rgba(255,255,255,0.55); margin-top:2px; }
        .tdp-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:1.2rem; padding:3rem 5%; }
        .tdp-card { background:rgba(15,8,59,0.5); border:1px solid rgba(84,22,181,0.12); border-radius:14px; overflow:hidden; cursor:pointer; transition:transform .28s,border-color .28s,box-shadow .28s; position:relative; }
        .tdp-card:hover { transform:translateY(-6px); border-color:rgba(84,22,181,0.5); box-shadow:0 12px 36px rgba(84,22,181,0.25); }
        .tdp-card-img { width:100%; height:180px; object-fit:cover; display:block; transition:transform .4s; background:#0a0420; }
        .tdp-card:hover .tdp-card-img { transform:scale(1.05); }
        .tdp-card-overlay { position:absolute; top:0; left:0; right:0; height:180px; background:linear-gradient(180deg,transparent 40%,rgba(12,5,22,0.9)); pointer-events:none; }
        .tdp-card-badge { position:absolute; top:10px; right:10px; background:linear-gradient(135deg,#5416B5,#7F3AA1); color:#fff; font-size:.7rem; font-family:'29LtBukra','Montserrat',sans-serif; font-weight:700; padding:.25rem .7rem; border-radius:50px; }
        .tdp-card-body { padding:1rem 1.1rem 1.1rem; }
        .tdp-card-name { font-family:'29LtBukra','Montserrat',sans-serif; font-size:1rem; font-weight:700; color:#fff; margin-bottom:.3rem; }
        .tdp-card-desc { font-size:.8rem; color:rgba(255,255,255,0.55); line-height:1.6; margin-bottom:.8rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .tdp-card-action { display:flex; align-items:center; justify-content:space-between; }
        .tdp-card-preview { font-size:.8rem; color:#9B59D0; display:inline-flex; align-items:center; gap:5px; }
        .tdp-card-imgs-count { font-size:.75rem; color:rgba(255,255,255,0.35); }
        .tdp-features { padding:3rem 5%; border-top:1px solid rgba(84,22,181,0.15); border-bottom:1px solid rgba(84,22,181,0.15); background:linear-gradient(180deg,#0C0516,#0F083B); }
        .tdp-features-title { text-align:center; font-family:'29LtBukra','Montserrat',sans-serif; font-size:1.6rem; font-weight:900; margin-bottom:.5rem; }
        .tdp-features-title span { background:linear-gradient(135deg,#9B59D0,#5416B5); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .tdp-features-sub { text-align:center; color:rgba(255,255,255,0.5); font-size:.9rem; margin-bottom:2rem; }
        .tdp-features-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1.2rem; }
        .tdp-feat-card { background:rgba(15,8,59,0.5); border:1px solid rgba(84,22,181,0.12); border-radius:12px; padding:1.4rem 1.2rem; text-align:center; transition:border-color .25s; }
        .tdp-feat-card:hover { border-color:rgba(84,22,181,0.4); }
        .tdp-feat-icon { width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg,rgba(84,22,181,0.25),rgba(127,58,161,0.15)); display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; font-size:1.2rem; color:#9B59D0; }
        .tdp-feat-card h4 { font-family:'29LtBukra','Montserrat',sans-serif; font-size:.95rem; font-weight:700; margin-bottom:.5rem; }
        .tdp-feat-card p { font-size:.8rem; color:rgba(255,255,255,0.5); line-height:1.6; }
        .tdp-contacts { padding:2.5rem 5%; text-align:center; }
        .tdp-contacts h3 { font-family:'29LtBukra','Montserrat',sans-serif; font-size:1.3rem; font-weight:900; margin-bottom:.5rem; }
        .tdp-contacts p { color:rgba(255,255,255,0.5); font-size:.9rem; margin-bottom:1.5rem; }
        .tdp-contact-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:.8rem; max-width:700px; margin:0 auto; }
        .tdp-contact-btn { display:flex; align-items:center; justify-content:center; gap:9px; padding:.85rem 1rem; border-radius:10px; background:rgba(15,8,59,0.6); border:1px solid rgba(84,22,181,0.2); color:#fff; font-family:'29LtBukra','Montserrat',sans-serif; font-size:.9rem; font-weight:600; text-decoration:none; transition:all .25s; }
        .tdp-contact-btn:hover { border-color:#5416B5; background:rgba(84,22,181,0.15); transform:translateY(-2px); }
        .tdp-empty { text-align:center; padding:70px 20px; color:rgba(155,89,208,0.4); grid-column:1/-1; }
        .tdp-empty i { font-size:3rem; display:block; margin-bottom:14px; opacity:.4; }
        .tdp-modal-bg { position:fixed; inset:0; background:rgba(0,0,0,0.88); backdrop-filter:blur(14px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:1.5rem; }
        .tdp-modal { background:linear-gradient(160deg,#0F083B 0%,#0C0516 60%,#130828 100%); border:1px solid rgba(84,22,181,0.35); border-radius:20px; width:min(96vw,1280px); height:min(88vh,780px); overflow:hidden; position:relative; display:flex; flex-direction:row; box-shadow:0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(84,22,181,0.08); }
        .tdp-modal-close { position:absolute; top:1rem; left:1rem; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.12); color:#fff; width:38px; height:38px; border-radius:50%; font-size:1.2rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .22s; z-index:20; }
        .tdp-modal-close:hover { background:rgba(84,22,181,0.6); border-color:#7F3AA1; transform:rotate(90deg); }
        .tdp-modal-body { display:contents; }
        .tdp-gallery { flex:1; display:flex; flex-direction:column; overflow:hidden; background:#05030f; }
        .tdp-gallery-main { flex:1; position:relative; overflow:hidden; min-height:0; display:flex; align-items:center; justify-content:center; }
        .tdp-gallery-main img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; display:block; transition:opacity .3s,transform .45s; }
        .tdp-gallery-main video { width:100%; height:100%; object-fit:contain; background:#000; }
        .tdp-gallery-main iframe { width:100%; height:100%; border:none; background:#000; }
        .tdp-gallery-nav { position:absolute; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.12); color:#fff; width:46px; height:46px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; font-size:1rem; backdrop-filter:blur(6px); z-index:5; }
        .tdp-gallery-nav:hover { background:rgba(84,22,181,0.65); border-color:#7F3AA1; }
        .tdp-gallery-nav.prev { right:14px; }
        .tdp-gallery-nav.next { left:14px; }
        .tdp-gallery-counter { position:absolute; bottom:10px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.55); backdrop-filter:blur(6px); border:1px solid rgba(255,255,255,0.08); border-radius:50px; padding:.25rem .85rem; font-size:.78rem; color:rgba(255,255,255,0.65); z-index:5; }
        .tdp-gallery-strip { display:flex; gap:.5rem; padding:.7rem .9rem; background:rgba(0,0,0,0.45); border-top:1px solid rgba(84,22,181,0.1); overflow-x:auto; flex-shrink:0; }
        .tdp-gallery-strip::-webkit-scrollbar { height:2px; }
        .tdp-gallery-strip::-webkit-scrollbar-thumb { background:rgba(84,22,181,0.35); border-radius:2px; }
        .tdp-gallery-dot { position:relative; width:72px; height:50px; border-radius:8px; overflow:hidden; cursor:pointer; border:2px solid transparent; transition:all .2s; flex-shrink:0; opacity:.5; }
        .tdp-gallery-dot:hover { opacity:.8; transform:translateY(-2px); }
        .tdp-gallery-dot.active { border-color:#7F3AA1; opacity:1; box-shadow:0 3px 12px rgba(84,22,181,0.45); }
        .tdp-gallery-dot img { width:100%; height:100%; object-fit:cover; }
        .tdp-gallery-dot .play { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.35); color:#fff; font-size:.8rem; }
        .tdp-modal-info { width:300px; flex-shrink:0; display:flex; flex-direction:column; padding:2rem 1.4rem 1.4rem; overflow-y:auto; border-right:1px solid rgba(84,22,181,0.1); gap:.9rem; }
        .tdp-modal-info::-webkit-scrollbar { width:2px; }
        .tdp-modal-info::-webkit-scrollbar-thumb { background:rgba(84,22,181,0.25); border-radius:2px; }
        .tdp-modal-cat { display:inline-flex; align-items:center; gap:6px; background:rgba(84,22,181,0.12); border:1px solid rgba(84,22,181,0.25); border-radius:50px; padding:.32rem .95rem; font-size:.8rem; color:#9B59D0; width:fit-content; }
        .tdp-modal-name { font-family:'29LtBukra','Montserrat',sans-serif; font-size:1.55rem; font-weight:900; line-height:1.25; background:linear-gradient(135deg,#fff 55%,#9B59D0); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .tdp-modal-divider { height:1px; background:linear-gradient(90deg,rgba(84,22,181,0.35),transparent); flex-shrink:0; }
        .tdp-modal-desc-box { background:rgba(15,8,59,0.45); border:1px solid rgba(84,22,181,0.1); border-radius:12px; padding:.8rem 1rem; }
        .tdp-modal-desc-box p { color:rgba(255,255,255,0.6); font-size:.85rem; line-height:1.75; margin:0; }
        .tdp-modal-actions { display:flex; flex-direction:column; gap:12px; margin-top:.5rem; padding-top:.9rem; border-top:1px solid rgba(84,22,181,0.1); }
        .tdp-modal-contact-label { font-size:.75rem; color:rgba(255,255,255,0.3); text-align:center; letter-spacing:.05em; }
        .tdp-modal-actions a { display:flex; align-items:center; gap:10px; padding:.75rem 1.1rem; border-radius:10px; font-family:'29LtBukra','Montserrat',sans-serif; font-size:.88rem; font-weight:700; text-decoration:none; transition:all .2s; white-space:nowrap; }
        .tdp-modal-actions a i { font-size:1.1rem; width:20px; text-align:center; flex-shrink:0; }
        .tdp-modal-actions a { background:rgba(15,8,59,0.6); border:1px solid rgba(84,22,181,0.25); color:#fff; }
        .tdp-modal-actions a:first-of-type { background:linear-gradient(135deg,#5416B5,#7F3AA1); border:none; box-shadow:0 4px 20px rgba(84,22,181,0.4); }
        .tdp-modal-actions a:first-of-type:hover { box-shadow:0 8px 28px rgba(84,22,181,0.6); transform:translateY(-2px); }
        .tdp-modal-actions a:hover { transform:translateY(-2px); border-color:#7F3AA1; }
        [data-reveal] { opacity:0; transition:opacity .75s ease,transform .75s cubic-bezier(.25,.8,.25,1); }
        [data-reveal="up"]    { transform:translateY(50px); }
        [data-reveal="left"]  { transform:translateX(-55px); }
        [data-reveal="right"] { transform:translateX(55px); }
        [data-reveal="scale"] { transform:scale(.85) translateY(18px); }
        [data-reveal].sr-in  { opacity:1; transform:none; }
        [data-delay="1"] { transition-delay:.06s; } [data-delay="2"] { transition-delay:.12s; } [data-delay="3"] { transition-delay:.18s; }
        [data-delay="4"] { transition-delay:.24s; } [data-delay="5"] { transition-delay:.30s; } [data-delay="6"] { transition-delay:.36s; }
        @media(max-width:768px){ .tdp-modal { flex-direction:column; height:min(92vh,820px); } .tdp-modal-info { width:100%; border-right:none; border-top:1px solid rgba(84,22,181,0.1); } }
      `}</style>

      {/* HERO */}
      <section className="tdp-hero">
        <div className="tdp-hero-videos" data-reveal="left">
          {[1, 2, 3].map(i => (
            <div key={i} className="tdp-hero-vid">
              <video autoPlay muted loop playsInline>
                <source src="https://res.cloudinary.com/v6vo90hw/video/upload/v1784782950/tilago/tilago.mp4" type="video/mp4" />
              </video>
            </div>
          ))}
        </div>
        <div className="tdp-hero-content" data-reveal="right">
          <div className="tdp-hero-tag"><i className="fas fa-cube" /> 3D Effects</div>
          <h1>أفضل تأثيرات <span>ثلاثية الأبعاد</span> من Tilago</h1>
          <div className="tdp-hero-divider" />
          <p>شعارات وإنتروهات ومشاهد ثلاثية الأبعاد مصممة باحترافية تليق بك وتميزك عن الجميع في عالم البث المباشر</p>
          <a href="#grid" className="tdp-hero-cta">تصفح التأثيرات <i className="fas fa-arrow-left" /></a>
        </div>
      </section>

      {/* STATS */}
      <div className="tdp-stats" data-reveal="up">
        {[
          { num: products.length > 0 ? `+${products.length}` : '0', label: 'تأثير 3D' },
          { num: '4K', label: 'دقة عالية' },
          { num: '24h', label: 'وقت التسليم' },
          { num: '100%', label: 'جودة مضمونة' },
        ].map(s => (
          <div className="tdp-stat" key={s.label}>
            <div className="tdp-stat-num">{s.num}</div>
            <div className="tdp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* CARDS */}
      <div className="tdp-grid" id="grid">
        {products.length === 0 ? (
          <div className="tdp-empty"><i className="fas fa-cube" /><p>لا توجد تأثيرات متاحة حالياً</p></div>
        ) : products.map((p, i) => (
          <div key={p.id} className="tdp-card" data-reveal="scale" data-delay={String((i % 6) + 1) as any}
            onClick={() => setModal({ product: p, imgIdx: 0 })}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="tdp-card-img" src={p.cover} alt={p.name} loading="lazy" />
            <div className="tdp-card-overlay" />
            {p.badge && <div className="tdp-card-badge">{p.badge}</div>}
            <div className="tdp-card-body">
              <div className="tdp-card-name">{p.name}</div>
              <div className="tdp-card-desc">{p.desc}</div>
              <div className="tdp-card-action">
                <span className="tdp-card-preview"><i className="fas fa-images" /> معاينة</span>
                <span className="tdp-card-imgs-count">{p.media.length} عنصر</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section className="tdp-features">
        <h2 className="tdp-features-title" data-reveal="up">لماذا تختار <span>Tilago 3D</span>؟</h2>
        <p className="tdp-features-sub" data-reveal="up">كل ما تحتاجه لتأثيرات ثلاثية الأبعاد في مكان واحد</p>
        <div className="tdp-features-grid">
          {FEATURES.map((f, i) => (
            <div className="tdp-feat-card" key={f.title} data-reveal="up" data-delay={String(i + 1) as any}>
              <div className="tdp-feat-icon"><i className={f.icon} /></div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACTS */}
      <section className="tdp-contacts" data-reveal="up">
        <h3>تواصل معنا الآن</h3>
        <p>اطلب تأثيرك المميز واحصل عليه بأسرع وقت</p>
        <div className="tdp-contact-grid">
          {CONTACT_BTNS.map(b => (
            <a key={b.label} href={b.href} target="_blank" rel="noreferrer" className="tdp-contact-btn">
              <i className={b.icon} style={{ color: b.color }} /> {b.label}
            </a>
          ))}
        </div>
      </section>

      {/* MODAL */}
      {modal && (
        <div className="tdp-modal-bg" onClick={() => setModal(null)}>
          <div className="tdp-modal" onClick={e => e.stopPropagation()}>
            <button className="tdp-modal-close" onClick={() => setModal(null)}>×</button>
            <div className="tdp-modal-body">
              {/* gallery */}
              <div className="tdp-gallery">
                <div className="tdp-gallery-main">
                  {(() => {
                    const src = modal.product.media[modal.imgIdx];
                    const kind = mediaKind(src);
                    if (kind === 'youtube') return <iframe src={youtubeEmbedUrl(src, { autoplay: false })!} title={modal.product.name} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
                    if (kind === 'video') return <video src={src} controls playsInline />;
                    // eslint-disable-next-line @next/next/no-img-element
                    return <img src={src} alt={modal.product.name} />;
                  })()}
                  {modal.product.media.length > 1 && (
                    <>
                      <button className="tdp-gallery-nav prev" onClick={() => setModal(m => m ? { ...m, imgIdx: (m.imgIdx + 1) % m.product.media.length } : m)}><i className="fas fa-chevron-right" /></button>
                      <button className="tdp-gallery-nav next" onClick={() => setModal(m => m ? { ...m, imgIdx: (m.imgIdx - 1 + m.product.media.length) % m.product.media.length } : m)}><i className="fas fa-chevron-left" /></button>
                      <div className="tdp-gallery-counter">{modal.imgIdx + 1} / {modal.product.media.length}</div>
                    </>
                  )}
                </div>
                {modal.product.media.length > 1 && (
                  <div className="tdp-gallery-strip">
                    {modal.product.media.map((img, idx) => (
                      <div key={idx} className={`tdp-gallery-dot${idx === modal.imgIdx ? ' active' : ''}`} onClick={() => setModal(m => m ? { ...m, imgIdx: idx } : m)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={mediaKind(img) === 'image' ? img : (videoPoster(img) ?? '')} alt="" />
                        {mediaKind(img) !== 'image' && <div className="play"><i className="fas fa-play" /></div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* info */}
              <div className="tdp-modal-info">
                <div className="tdp-modal-name">{modal.product.name}</div>
                <div className="tdp-modal-divider" />
                <div className="tdp-modal-desc-box"><p>{modal.product.desc}</p></div>
                <div className="tdp-modal-actions">
                  <div className="tdp-modal-contact-label">تواصل معنا للطلب</div>
                  <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer"><i className="fab fa-whatsapp" /> اطلب الآن عبر واتساب</a>
                  <a href="https://t.me/yourchannel" target="_blank" rel="noreferrer"><i className="fab fa-telegram" /> تيليجرام</a>
                  <a href="https://discord.gg/yourserver" target="_blank" rel="noreferrer"><i className="fab fa-discord" /> ديسكورد</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';

/* ─── Data ─────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: 'all',      label: 'الكل',               icon: 'fas fa-th' },
  { id: 'logo3d',   label: 'شعارات 3D',           icon: 'fas fa-cube' },
  { id: 'intro3d',  label: 'إنترو 3D',            icon: 'fas fa-film' },
  { id: 'particle', label: 'تأثيرات الجزيئات',    icon: 'fas fa-star' },
  { id: 'hologram', label: 'هولوغرام',             icon: 'fas fa-ghost' },
  { id: 'text3d',   label: 'نصوص 3D',              icon: 'fas fa-font' },
  { id: 'scene3d',  label: 'مشاهد كاملة',          icon: 'fas fa-mountain' },
];

type Product = {
  id: string; cat: string; name: string; nameEn: string;
  desc: string; badge?: string;
  imgs: string[]; // gradient stops for placeholder images
};

/* real image pools — only clear high-res images (>200KB) */
const V = (n: number) => `/photo/venom-${n}.png`;
// Clear venom images only: 1,2,5,7,9,10,11
const CV = [V(1), V(2), V(5), V(7), V(9), V(10), V(11)];
const IMG = {
  a3d:     '/photo/alert-3d.png',
  anime:   '/photo/anime.png',
  gift:    '/photo/alert-gift.png',
  follow:  '/photo/alert-follow.png',
  special: '/photo/alert-special.png',
  emblem:  '/photo/tilago-emblem.png',
  w:       '/w.png',
  img55:   '/55.png',
  img023:  '/023.png',
  images:  '/images.png',
};

const PRODUCTS: Product[] = [
  /* ── Logo 3D ── */
  { id:'l1', cat:'logo3d', name:'Venom Logo 3D',   nameEn:'Venom Logo 3D',   desc:'شعار فينوم ثلاثي الأبعاد بتفاصيل سينمائية مذهلة وتأثيرات ضوئية احترافية',  badge:'الأكثر طلباً', imgs:[CV[0], CV[1], CV[2], CV[3]] },
  { id:'l2', cat:'logo3d', name:'Anime Logo 3D',   nameEn:'Anime Logo 3D',   desc:'شعار أنيمي ثلاثي الأبعاد بأسلوب ياباني أصيل ويناسب جميع أنواع البثاثين',              imgs:[IMG.anime,  CV[4],  CV[5],  IMG.a3d] },
  { id:'l3', cat:'logo3d', name:'Emblem Logo',     nameEn:'Emblem Logo',     desc:'شعار نبالة ثلاثي الأبعاد بطابع ملكي فاخر يليق بهويتك البصرية',                         imgs:[IMG.emblem, CV[6],  CV[0],  IMG.img55] },
  { id:'l4', cat:'logo3d', name:'Crystal Logo',    nameEn:'Crystal Logo',    desc:'شعار بلوري ثلاثي الأبعاد بتأثيرات ضوئية شفافة تجعل علامتك لا تُنسى',                  imgs:[IMG.w,      CV[1],  CV[3],  IMG.img023] },
  { id:'l5', cat:'logo3d', name:'Neon Logo 3D',    nameEn:'Neon Logo 3D',    desc:'شعار نيون مضيء ثلاثي الأبعاد بألوان زاهية تضفي حيوية على بثك', badge:'جديد',             imgs:[IMG.images, CV[2],  CV[5],  IMG.a3d] },
  { id:'l6', cat:'logo3d', name:'Tilago Emblem',   nameEn:'Tilago Emblem',   desc:'شعار Tilago ثلاثي الأبعاد الحصري الذي يجسد الاحترافية في كل تفصيلة',                   imgs:[IMG.emblem, IMG.a3d, CV[4], CV[6]] },

  /* ── Intro 3D ── */
  { id:'i1', cat:'intro3d', name:'Venom Intro',    nameEn:'Venom Intro',    desc:'إنترو فينوم ثلاثي الأبعاد يفتح بثك بقوة ودراما سينمائية لا مثيل لها', badge:'الأكثر طلباً', imgs:[CV[0], CV[2], CV[4], CV[6]] },
  { id:'i2', cat:'intro3d', name:'Anime Intro',    nameEn:'Anime Intro',    desc:'إنترو أنيمي ثلاثي الأبعاد بحركات سلسة وألوان جذابة تأسر المشاهدين',                      imgs:[IMG.anime,   CV[1],  CV[5],  IMG.a3d] },
  { id:'i3', cat:'intro3d', name:'Epic Intro',     nameEn:'Epic Intro',     desc:'إنترو ملحمي ثلاثي الأبعاد بأجواء تصنع من كل بث حدث استثنائي',                           imgs:[IMG.special, CV[3],  CV[6],  IMG.img55] },
  { id:'i4', cat:'intro3d', name:'Cyber Intro',    nameEn:'Cyber Intro',    desc:'إنترو سيبراني ثلاثي الأبعاد من المستقبل بتقنيات بصرية متقدمة',                           imgs:[IMG.w,       CV[0],  CV[4],  IMG.img023] },
  { id:'i5', cat:'intro3d', name:'Crystal Intro',  nameEn:'Crystal Intro',  desc:'إنترو بلوري ثلاثي الأبعاد بشفافية ووضوح يجعلان البداية مميزة', badge:'جديد',              imgs:[IMG.images,  CV[2],  CV[5],  IMG.emblem] },
  { id:'i6', cat:'intro3d', name:'Galaxy Intro',   nameEn:'Galaxy Intro',   desc:'إنترو كوني ثلاثي الأبعاد يأخذك في رحلة بين النجوم والمجرات البعيدة',                    imgs:[IMG.a3d,     CV[1],  CV[3],  CV[6]] },

  /* ── Particle ── */
  { id:'p1', cat:'particle', name:'Venom Particles',  nameEn:'Venom Particles',  desc:'تأثير جزيئات فينوم ثلاثي الأبعاد بانفجارات بصرية مدروسة وجذابة', badge:'الأكثر طلباً', imgs:[CV[0], CV[3], CV[5], CV[6]] },
  { id:'p2', cat:'particle', name:'Anime Particles',  nameEn:'Anime Particles',  desc:'تأثير جزيئات أنيمي بألوان زاهية تضفي سحراً بصرياً على مشهدك',                        imgs:[IMG.anime,   IMG.gift, CV[1],  CV[4]] },
  { id:'p3', cat:'particle', name:'Magic Dust',       nameEn:'Magic Dust',       desc:'تأثير الغبار السحري ثلاثي الأبعاد بجزيئات متلألئة تملأ الشاشة روعة',                 imgs:[IMG.special, CV[2],   CV[5],  IMG.img55] },
  { id:'p4', cat:'particle', name:'Star Burst',       nameEn:'Star Burst',       desc:'تأثير انفجار النجوم بجزيئات ثلاثية الأبعاد تتطاير بحيوية لا تُقاوم',               imgs:[IMG.w,       CV[0],   CV[3],  IMG.img023] },
  { id:'p5', cat:'particle', name:'Lightning Storm',  nameEn:'Lightning Storm',  desc:'تأثير عاصفة البرق ثلاثية الأبعاد بقوة بصرية تُبهر كل من يشاهدك', badge:'جديد',       imgs:[IMG.images,  CV[4],   CV[6],  IMG.emblem] },
  { id:'p6', cat:'particle', name:'Follow Burst',     nameEn:'Follow Burst',     desc:'تأثير جزيئات خاص بتنبيه المتابعة يجعل كل متابع يشعر بأهميته',                        imgs:[IMG.follow,  CV[1],   CV[5],  CV[2]] },

  /* ── Hologram ── */
  { id:'h1', cat:'hologram', name:'Venom Hologram',   nameEn:'Venom Hologram',   desc:'هولوغرام فينوم ثلاثي الأبعاد بمستوى مستقبلي وتأثيرات بصرية مبهرة', badge:'الأكثر طلباً', imgs:[CV[0], CV[2], CV[5], CV[6]] },
  { id:'h2', cat:'hologram', name:'Anime Hologram',   nameEn:'Anime Hologram',   desc:'هولوغرام أنيمي ثلاثي الأبعاد يمنح شخصيتك بُعداً بصرياً استثنائياً',                  imgs:[IMG.anime,   CV[1],  CV[4],  IMG.a3d] },
  { id:'h3', cat:'hologram', name:'Tech Hologram',    nameEn:'Tech Hologram',    desc:'هولوغرام تقني ثلاثي الأبعاد بتأثيرات ضوئية متعددة الطبقات',                           imgs:[IMG.special, CV[3],  CV[6],  IMG.img55] },
  { id:'h4', cat:'hologram', name:'Ghost Hologram',   nameEn:'Ghost Hologram',   desc:'هولوغرام شبحي شفاف بتأثيرات غامضة وجذابة تُفتن المشاهدين', badge:'جديد',               imgs:[IMG.w,       CV[0],  CV[5],  IMG.emblem] },

  /* ── Text 3D ── */
  { id:'t1', cat:'text3d', name:'Venom Text 3D',   nameEn:'Venom Text 3D',   desc:'نص فينوم ثلاثي الأبعاد بتفاصيل سينمائية وتأثيرات مذهلة', badge:'الأكثر طلباً',             imgs:[CV[0], CV[3], CV[5], CV[1]] },
  { id:'t2', cat:'text3d', name:'Neon Text',        nameEn:'Neon Text',        desc:'نص نيون ثلاثي الأبعاد بألوان مضيئة وحيوية تجعل اسمك يتألق',                              imgs:[IMG.a3d,    CV[2],  CV[6],  IMG.anime] },
  { id:'t3', cat:'text3d', name:'Chrome Text',      nameEn:'Chrome Text',      desc:'نص كروم ثلاثي الأبعاد بلمعة معدنية فاخرة تليق بالمحترفين',                              imgs:[IMG.img55,  CV[4],  CV[0],  IMG.emblem] },
  { id:'t4', cat:'text3d', name:'Gold Text',        nameEn:'Gold Text',        desc:'نص ذهبي ثلاثي الأبعاد بفخامة لا حدود لها ويناسب كبار المبدعين', badge:'جديد',            imgs:[IMG.img023, CV[1],  CV[5],  IMG.w] },
  { id:'t5', cat:'text3d', name:'Crystal Text',     nameEn:'Crystal Text',     desc:'نص بلوري ثلاثي الأبعاد بشفافية وأناقة تجعل كلماتك تبدو أكثر جمالاً',                   imgs:[IMG.images, CV[6],  CV[3],  IMG.special] },

  /* ── Scene 3D ── */
  { id:'sc1', cat:'scene3d', name:'Venom Scene',    nameEn:'Venom Scene',    desc:'مشهد فينوم ثلاثي الأبعاد كامل بجودة سينمائية مذهلة تُبهر جمهورك', badge:'الأكثر طلباً',    imgs:[CV[0], CV[1], CV[2], CV[3]] },
  { id:'sc2', cat:'scene3d', name:'Anime Scene',    nameEn:'Anime Scene',    desc:'مشهد أنيمي ثلاثي الأبعاد يجمع بين الجمال الياباني والتأثيرات البصرية الحديثة',            imgs:[IMG.anime,   CV[4],  CV[5],  CV[6]] },
  { id:'sc3', cat:'scene3d', name:'Epic Battle',    nameEn:'Epic Battle',    desc:'مشهد معركة ملحمية ثلاثي الأبعاد يحوّل بثك إلى تجربة سينمائية كاملة', badge:'جديد',         imgs:[IMG.special, CV[0],  CV[3],  CV[6]] },
  { id:'sc4', cat:'scene3d', name:'Cyber World',    nameEn:'Cyber World',    desc:'مشهد عالم سيبراني ثلاثي الأبعاد من المستقبل بتأثيرات لا حدود لها',                       imgs:[IMG.w,       CV[1],  CV[4],  CV[5]] },
];

const CONTACT_BTNS = [
  { icon: 'fab fa-whatsapp', label: 'واتساب',       href: 'https://wa.me/1234567890',      color: '#25D366' },
  { icon: 'fab fa-telegram', label: 'تيليجرام',     href: 'https://t.me/yourchannel',      color: '#0088cc' },
  { icon: 'fab fa-discord',  label: 'ديسكورد',      href: 'https://discord.gg/yourserver', color: '#5865F2' },
  { icon: 'fas fa-headset',  label: 'خدمة العملاء', href: 'mailto:support@tilago.com',     color: '#7F3AA1' },
];

const FEATURES = [
  { icon: 'fas fa-cube',        title: 'جودة سينمائية',     desc: 'تأثيرات ثلاثية الأبعاد بجودة احترافية تليق بكبار البثاثين' },
  { icon: 'fas fa-bolt',        title: 'تسليم سريع',         desc: 'نسلمك مشروعك في أقصر وقت ممكن دون أي تنازل عن الجودة' },
  { icon: 'fas fa-paint-brush', title: 'تخصيص كامل',         desc: 'كل تأثير قابل للتخصيص الكامل ليناسب هويتك البصرية' },
  { icon: 'fas fa-headset',     title: 'دعم مستمر',           desc: 'فريقنا متاح لدعمك وتعديل أي شيء حتى تحصل على المثالية' },
];

/* ─── Component ─────────────────────────────────────────────── */
type ModalState = { product: Product; imgIdx: number } | null;

export default function ThreeDPage() {
  const [activeCat, setActiveCat]   = useState('all');
  const [modal, setModal]           = useState<ModalState>(null);
  const revRef                      = useRef<HTMLDivElement>(null);

  const filtered = activeCat === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.cat === activeCat);

  /* scroll reveal */
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add('sr-in'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* keyboard nav in modal */
  useEffect(() => {
    if (!modal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModal(null);
      if (e.key === 'ArrowLeft')  setModal(m => m ? { ...m, imgIdx: (m.imgIdx + 1) % m.product.imgs.length } : m);
      if (e.key === 'ArrowRight') setModal(m => m ? { ...m, imgIdx: (m.imgIdx - 1 + m.product.imgs.length) % m.product.imgs.length } : m);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modal]);

  return (
    <div className="tdp" dir="rtl" ref={revRef}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Cairo:wght@400;600;700;900&display=swap');

        .tdp { background:linear-gradient(180deg,#0F083B,#0C0516); min-height:100vh; font-family:'Cairo',sans-serif; color:#fff; }

        /* ── HERO ── */
        .tdp-hero { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-around; padding:4rem 5%; gap:2rem; }
        .tdp-hero-videos { display:flex; gap:1rem; justify-content:center; flex-wrap:nowrap; }
        .tdp-hero-vid { width:320px; flex-shrink:0; border-radius:14px; overflow:hidden; border:1px solid rgba(84,22,181,0.35); box-shadow:0 4px 28px rgba(0,0,0,0.55); }
        .tdp-hero-vid video { width:100%; display:block; }
        .tdp-hero-content { flex:1; min-width:280px; max-width:540px; text-align:right; }
        .tdp-hero-tag { display:inline-flex; align-items:center; gap:8px; background:rgba(84,22,181,0.15); border:1px solid rgba(84,22,181,0.35); border-radius:50px; padding:.45rem 1.2rem; font-size:.85rem; color:#9B59D0; margin-bottom:1.2rem; }
        .tdp-hero-content h1 { font-family:'Cairo',sans-serif; font-size:clamp(1.9rem,3.5vw,2.7rem); font-weight:900; line-height:1.25; margin-bottom:.8rem; }
        .tdp-hero-content h1 span { background:linear-gradient(135deg,#9B59D0,#5416B5); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .tdp-hero-divider { width:40px; height:2px; background:linear-gradient(90deg,#5416B5,rgba(84,22,181,0)); margin-bottom:1.2rem; }
        .tdp-hero-content p { color:rgba(255,255,255,0.7); font-size:1rem; line-height:1.8; margin-bottom:1.6rem; }
        .tdp-hero-cta { display:inline-flex; align-items:center; gap:10px; padding:.9rem 2.2rem; border-radius:50px; background:linear-gradient(135deg,#5416B5,#7F3AA1); color:#fff; font-family:'Cairo',sans-serif; font-size:1rem; font-weight:700; text-decoration:none; transition:transform .2s,box-shadow .2s; }
        .tdp-hero-cta:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(84,22,181,0.5); }

        /* ── STATS ── */
        .tdp-stats { display:flex; justify-content:center; gap:0; padding:1.4rem 5%; border-top:1px solid rgba(84,22,181,0.12); border-bottom:1px solid rgba(84,22,181,0.12); background:rgba(15,8,59,0.4); flex-wrap:wrap; }
        .tdp-stat { flex:1; min-width:120px; text-align:center; padding:.8rem 1.5rem; border-left:1px solid rgba(84,22,181,0.2); }
        .tdp-stat:last-child { border-left:none; }
        .tdp-stat-num { font-family:'Orbitron',sans-serif; font-size:1.5rem; font-weight:700; background:linear-gradient(135deg,#9B59D0,#5416B5); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .tdp-stat-label { font-size:.8rem; color:rgba(255,255,255,0.55); margin-top:2px; }

        /* ── CATEGORIES FILTER ── */
        .tdp-filter { padding:2.5rem 5% 1rem; }
        .tdp-filter-inner { display:flex; flex-wrap:wrap; gap:.7rem; justify-content:center; }
        .tdp-filter-btn { display:inline-flex; align-items:center; gap:7px; padding:.55rem 1.3rem; border-radius:50px; background:rgba(15,8,59,0.6); border:1px solid rgba(84,22,181,0.2); color:rgba(255,255,255,0.6); font-family:'Cairo',sans-serif; font-size:.9rem; cursor:pointer; transition:all .25s; }
        .tdp-filter-btn:hover { border-color:#5416B5; color:#fff; }
        .tdp-filter-btn.active { background:linear-gradient(135deg,#5416B5,#7F3AA1); border-color:transparent; color:#fff; box-shadow:0 4px 16px rgba(84,22,181,0.4); }

        /* ── CARDS GRID ── */
        .tdp-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:1.2rem; padding:1.5rem 5% 3rem; }
        .tdp-card { background:rgba(15,8,59,0.5); border:1px solid rgba(84,22,181,0.12); border-radius:14px; overflow:hidden; cursor:pointer; transition:transform .28s,border-color .28s,box-shadow .28s; position:relative; }
        .tdp-card:hover { transform:translateY(-6px); border-color:rgba(84,22,181,0.5); box-shadow:0 12px 36px rgba(84,22,181,0.25); }
        .tdp-card-img { width:100%; height:180px; object-fit:cover; display:block; transition:transform .4s; }
        .tdp-card:hover .tdp-card-img { transform:scale(1.05); }
        .tdp-card-overlay { position:absolute; top:0; left:0; right:0; height:180px; background:linear-gradient(180deg,transparent 40%,rgba(12,5,22,0.9)); pointer-events:none; }
        .tdp-card-badge { position:absolute; top:10px; right:10px; background:linear-gradient(135deg,#5416B5,#7F3AA1); color:#fff; font-size:.7rem; font-family:'Cairo',sans-serif; font-weight:700; padding:.25rem .7rem; border-radius:50px; }
        .tdp-card-body { padding:1rem 1.1rem 1.1rem; }
        .tdp-card-name { font-family:'Cairo',sans-serif; font-size:1rem; font-weight:700; color:#fff; margin-bottom:.3rem; }
        .tdp-card-desc { font-size:.8rem; color:rgba(255,255,255,0.55); line-height:1.6; margin-bottom:.8rem; }
        .tdp-card-action { display:flex; align-items:center; justify-content:space-between; }
        .tdp-card-preview { font-size:.8rem; color:#9B59D0; display:inline-flex; align-items:center; gap:5px; }
        .tdp-card-imgs-count { font-size:.75rem; color:rgba(255,255,255,0.35); }

        /* ── FEATURES ── */
        .tdp-features { padding:3rem 5%; border-top:1px solid rgba(84,22,181,0.15); border-bottom:1px solid rgba(84,22,181,0.15); background:linear-gradient(180deg,#0C0516,#0F083B); }
        .tdp-features-title { text-align:center; font-family:'Cairo',sans-serif; font-size:1.6rem; font-weight:900; margin-bottom:.5rem; }
        .tdp-features-title span { background:linear-gradient(135deg,#9B59D0,#5416B5); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .tdp-features-sub { text-align:center; color:rgba(255,255,255,0.5); font-size:.9rem; margin-bottom:2rem; }
        .tdp-features-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1.2rem; }
        .tdp-feat-card { background:rgba(15,8,59,0.5); border:1px solid rgba(84,22,181,0.12); border-radius:12px; padding:1.4rem 1.2rem; text-align:center; transition:border-color .25s; }
        .tdp-feat-card:hover { border-color:rgba(84,22,181,0.4); }
        .tdp-feat-icon { width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg,rgba(84,22,181,0.25),rgba(127,58,161,0.15)); display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; font-size:1.2rem; color:#9B59D0; }
        .tdp-feat-card h4 { font-family:'Cairo',sans-serif; font-size:.95rem; font-weight:700; margin-bottom:.5rem; }
        .tdp-feat-card p { font-size:.8rem; color:rgba(255,255,255,0.5); line-height:1.6; }

        /* ── CONTACTS ── */
        .tdp-contacts { padding:2.5rem 5%; text-align:center; }
        .tdp-contacts h3 { font-family:'Cairo',sans-serif; font-size:1.3rem; font-weight:900; margin-bottom:.5rem; }
        .tdp-contacts p { color:rgba(255,255,255,0.5); font-size:.9rem; margin-bottom:1.5rem; }
        .tdp-contact-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:.8rem; max-width:700px; margin:0 auto; }
        .tdp-contact-btn { display:flex; align-items:center; justify-content:center; gap:9px; padding:.85rem 1rem; border-radius:10px; background:rgba(15,8,59,0.6); border:1px solid rgba(84,22,181,0.2); color:#fff; font-family:'Cairo',sans-serif; font-size:.9rem; font-weight:600; text-decoration:none; transition:all .25s; }
        .tdp-contact-btn:hover { border-color:#5416B5; background:rgba(84,22,181,0.15); transform:translateY(-2px); }

        /* ── MODAL ── */
        .tdp-modal-bg { position:fixed; inset:0; background:rgba(0,0,0,0.88); backdrop-filter:blur(14px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:1.5rem; }
        .tdp-modal {
          background:linear-gradient(160deg,#0F083B 0%,#0C0516 60%,#130828 100%);
          border:1px solid rgba(84,22,181,0.35);
          border-radius:20px;
          width:min(96vw,1280px);
          height:min(88vh,780px);
          overflow:hidden;
          position:relative;
          display:flex;
          flex-direction:row;
          box-shadow:0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(84,22,181,0.08);
        }

        /* close btn */
        .tdp-modal-close { position:absolute; top:1rem; left:1rem; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.12); color:#fff; width:38px; height:38px; border-radius:50%; font-size:1.2rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .22s; z-index:20; }
        .tdp-modal-close:hover { background:rgba(84,22,181,0.6); border-color:#7F3AA1; transform:rotate(90deg); }

        /* body = row */
        .tdp-modal-body { display:contents; }

        /* LEFT — gallery fills all height */
        .tdp-gallery { flex:1; display:flex; flex-direction:column; overflow:hidden; background:#05030f; }
        .tdp-gallery-main { flex:1; position:relative; overflow:hidden; min-height:0; }
        .tdp-gallery-main img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; display:block; transition:opacity .3s,transform .45s; }
        .tdp-gallery-main img:hover { transform:scale(1.025); }
        .tdp-gallery-nav { position:absolute; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.12); color:#fff; width:46px; height:46px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; font-size:1rem; backdrop-filter:blur(6px); }
        .tdp-gallery-nav:hover { background:rgba(84,22,181,0.65); border-color:#7F3AA1; }
        .tdp-gallery-nav.prev { right:14px; }
        .tdp-gallery-nav.next { left:14px; }
        .tdp-gallery-counter { position:absolute; bottom:10px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.55); backdrop-filter:blur(6px); border:1px solid rgba(255,255,255,0.08); border-radius:50px; padding:.25rem .85rem; font-size:.78rem; color:rgba(255,255,255,0.65); }

        /* thumbnails strip */
        .tdp-gallery-strip { display:flex; gap:.5rem; padding:.7rem .9rem; background:rgba(0,0,0,0.45); border-top:1px solid rgba(84,22,181,0.1); overflow-x:auto; flex-shrink:0; }
        .tdp-gallery-strip::-webkit-scrollbar { height:2px; }
        .tdp-gallery-strip::-webkit-scrollbar-thumb { background:rgba(84,22,181,0.35); border-radius:2px; }
        .tdp-gallery-dot { width:72px; height:50px; border-radius:8px; overflow:hidden; cursor:pointer; border:2px solid transparent; transition:all .2s; flex-shrink:0; opacity:.5; }
        .tdp-gallery-dot:hover { opacity:.8; transform:translateY(-2px); }
        .tdp-gallery-dot.active { border-color:#7F3AA1; opacity:1; box-shadow:0 3px 12px rgba(84,22,181,0.45); }
        .tdp-gallery-dot img { width:100%; height:100%; object-fit:cover; }

        /* RIGHT — info panel fixed width */
        .tdp-modal-info { width:300px; flex-shrink:0; display:flex; flex-direction:column; padding:2rem 1.4rem 1.4rem; overflow-y:auto; border-right:1px solid rgba(84,22,181,0.1); gap:.9rem; }
        .tdp-modal-info::-webkit-scrollbar { width:2px; }
        .tdp-modal-info::-webkit-scrollbar-thumb { background:rgba(84,22,181,0.25); border-radius:2px; }
        .tdp-modal-cat { display:inline-flex; align-items:center; gap:6px; background:rgba(84,22,181,0.12); border:1px solid rgba(84,22,181,0.25); border-radius:50px; padding:.32rem .95rem; font-size:.8rem; color:#9B59D0; width:fit-content; }
        .tdp-modal-name { font-family:'Cairo',sans-serif; font-size:1.55rem; font-weight:900; line-height:1.25; background:linear-gradient(135deg,#fff 55%,#9B59D0); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .tdp-modal-divider { height:1px; background:linear-gradient(90deg,rgba(84,22,181,0.35),transparent); flex-shrink:0; }
        .tdp-modal-desc-box { background:rgba(15,8,59,0.45); border:1px solid rgba(84,22,181,0.1); border-radius:12px; padding:.8rem 1rem; }
        .tdp-modal-desc-box p { color:rgba(255,255,255,0.6); font-size:.85rem; line-height:1.75; margin:0; }
        .tdp-modal-contact-label { font-size:.75rem; color:rgba(255,255,255,0.3); text-align:center; letter-spacing:.05em; }
        .tdp-modal-actions { display:flex; flex-direction:column; gap:25px; margin-top:.5rem; padding-top:.9rem; border-top:1px solid rgba(84,22,181,0.1); }
        .tdp-modal-actions-label { font-size:.78rem; color:rgba(255,255,255,0.35); text-align:center; margin-bottom:.2rem; }
        .tdp-modal-actions a { display:flex; align-items:center; gap:10px; padding:.75rem 1.1rem; border-radius:10px; font-family:'Cairo',sans-serif; font-size:.88rem; font-weight:700; text-decoration:none; transition:all .2s; white-space:nowrap; }
        .tdp-modal-actions a i { font-size:1.1rem; width:20px; text-align:center; flex-shrink:0; }
        .tdp-modal-actions a { background:rgba(15,8,59,0.6); border:1px solid rgba(84,22,181,0.25); color:#fff; }
        .tdp-modal-actions a:first-child { background:linear-gradient(135deg,#5416B5,#7F3AA1); border:none; box-shadow:0 4px 20px rgba(84,22,181,0.4); }
        .tdp-modal-actions a:first-child:hover { box-shadow:0 8px 28px rgba(84,22,181,0.6); transform:translateY(-2px); }
        .tdp-modal-actions a:nth-child(2) { background:rgba(84,22,181,0.12); border:1px solid rgba(127,58,161,0.35); }
        .tdp-modal-actions a:nth-child(2):hover { background:rgba(84,22,181,0.25); border-color:#7F3AA1; transform:translateY(-2px); }
        .tdp-modal-actions a:nth-child(3) { background:rgba(84,22,181,0.06); border:1px solid rgba(127,58,161,0.2); }
        .tdp-modal-actions a:nth-child(3):hover { background:rgba(84,22,181,0.2); border-color:#7F3AA1; transform:translateY(-2px); }

        /* scroll reveal */
        [data-reveal] { opacity:0; transition:opacity .75s ease,transform .75s cubic-bezier(.25,.8,.25,1); }
        [data-reveal="up"]    { transform:translateY(50px); }
        [data-reveal="left"]  { transform:translateX(-55px); }
        [data-reveal="right"] { transform:translateX(55px); }
        [data-reveal="scale"] { transform:scale(.85) translateY(18px); }
        [data-reveal].sr-in  { opacity:1; transform:none; }
        [data-delay="1"] { transition-delay:.06s; }
        [data-delay="2"] { transition-delay:.12s; }
        [data-delay="3"] { transition-delay:.18s; }
        [data-delay="4"] { transition-delay:.24s; }
        [data-delay="5"] { transition-delay:.30s; }
        [data-delay="6"] { transition-delay:.36s; }

        @media(max-width:600px) {
          .tdp-hero { padding:2.5rem 4%; }
          .tdp-gallery-main img { height:220px; }
          .tdp-modal-body { gap:1rem; padding:1rem; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="tdp-hero">
        <div className="tdp-hero-videos" data-reveal="left">
          {[1,2,3].map(i => (
            <div key={i} className="tdp-hero-vid">
              <video autoPlay muted loop playsInline>
                <source src="/video/tilago.mp4" type="video/mp4" />
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

      {/* ── STATS ── */}
      <div className="tdp-stats" data-reveal="up">
        {[
          { num: '+30', label: 'تأثير 3D' },
          { num: '6',   label: 'تصنيف' },
          { num: '24h', label: 'وقت التسليم' },
          { num: '100%', label: 'جودة مضمونة' },
        ].map(s => (
          <div className="tdp-stat" key={s.label}>
            <div className="tdp-stat-num">{s.num}</div>
            <div className="tdp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div id="grid" />

      {/* ── CARDS ── */}
      <div className="tdp-grid">
        {filtered.map((p, i) => (
          <div
            key={p.id}
            className="tdp-card"
            data-reveal="scale"
            data-delay={String((i % 6) + 1) as any}
            onClick={() => setModal({ product: p, imgIdx: 0 })}
          >
            <img className="tdp-card-img" src={p.imgs[0]} alt={p.name} loading="lazy" />
            <div className="tdp-card-overlay" />
            <div className="tdp-card-body">
              <div className="tdp-card-name">{p.name}</div>
              <div className="tdp-card-desc">{p.desc}</div>
              <div className="tdp-card-action">
                <span className="tdp-card-preview"><i className="fas fa-images" /> معاينة</span>
                <span className="tdp-card-imgs-count">{p.imgs.length} صور</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
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

      {/* ── CONTACTS ── */}
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

      {/* ── MODAL ── */}
      {modal && (
        <div className="tdp-modal-bg" onClick={() => setModal(null)}>
          <div className="tdp-modal" onClick={e => e.stopPropagation()}>
            <button className="tdp-modal-close" onClick={() => setModal(null)}>×</button>

            <div className="tdp-modal-body">
              {/* LEFT — gallery */}
              <div className="tdp-gallery">
                <div className="tdp-gallery-main">
                  <img src={modal.product.imgs[modal.imgIdx]} alt={modal.product.name} />
                  <button className="tdp-gallery-nav prev" onClick={() => setModal(m => m ? { ...m, imgIdx: (m.imgIdx + 1) % m.product.imgs.length } : m)}>
                    <i className="fas fa-chevron-right" />
                  </button>
                  <button className="tdp-gallery-nav next" onClick={() => setModal(m => m ? { ...m, imgIdx: (m.imgIdx - 1 + m.product.imgs.length) % m.product.imgs.length } : m)}>
                    <i className="fas fa-chevron-left" />
                  </button>
                  <div className="tdp-gallery-counter">{modal.imgIdx + 1} / {modal.product.imgs.length}</div>
                </div>
                {/* thumbnail strip */}
                <div className="tdp-gallery-strip">
                  {modal.product.imgs.map((img, idx) => (
                    <div key={idx} className={`tdp-gallery-dot${idx === modal.imgIdx ? ' active' : ''}`}
                      onClick={() => setModal(m => m ? { ...m, imgIdx: idx } : m)}>
                      <img src={img} alt="" />
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — info */}
              <div className="tdp-modal-info">
                <div className="tdp-modal-cat">
                  <i className={CATEGORIES.find(c => c.id === modal.product.cat)?.icon} />
                  {CATEGORIES.find(c => c.id === modal.product.cat)?.label}
                </div>
                <div className="tdp-modal-name">{modal.product.name}</div>
                <div className="tdp-modal-divider" />
                <div className="tdp-modal-desc-box">
                  <p>{modal.product.desc}</p>
                </div>
                <div className="tdp-modal-actions">
                  <div className="tdp-modal-contact-label">تواصل معنا للطلب</div>
                  <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer">
                    <i className="fab fa-whatsapp" /> اطلب الآن عبر واتساب
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
        </div>
      )}
    </div>
  );
}

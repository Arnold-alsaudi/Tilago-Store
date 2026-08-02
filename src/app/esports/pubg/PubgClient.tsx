'use client';

import Link from 'next/link';
import { useState } from 'react';
import { isYouTubeUrl, youtubeEmbedUrl } from '@/lib/youtube';

export interface PubgPkg {
  id: string;
  name: string;
  nameAr: string;
  cover: string;
  images: string[];
  video?: string;
}

const CONTACTS = [
  { icon:'fab fa-whatsapp', label:'واتساب',      sub:'اطلب الآن مباشرةً',       href:'https://wa.me/1234567890',       c:'#25D366' },
  { icon:'fab fa-telegram', label:'تيليجرام',    sub:'تواصل معنا على تيليجرام',  href:'https://t.me/yourchannel',       c:'#0088cc' },
  { icon:'fab fa-discord',  label:'ديسكورد',     sub:'انضم لسيرفر الدعم',        href:'https://discord.gg/yourserver',  c:'#5865F2' },
  { icon:'fas fa-headset',  label:'الدعم الفني', sub:'نرد خلال 24 ساعة',         href:'mailto:support@tilago.com',      c:'#9B59D0' },
];

const TICKER_WORDS = ['Championship','Team Logo','Tournament Overlay','Bracket Design','PUBG Pack','Winner Screen','Rank Badge','Esports Kit'];

const FEATURES = [
  { icon:'fas fa-trophy',      title:'تصميم بطولي',   desc:'تصاميم احترافية مخصصة لبطولات PUBG تعكس هوية فريقك بشكل مميز.' },
  { icon:'fas fa-bolt',        title:'تسليم سريع',    desc:'تستلم تصميمك كاملاً خلال 24 ساعة من وقت الطلب.' },
  { icon:'fas fa-sliders-h',   title:'تخصيص كامل',   desc:'أضف اسم فريقك وشعارك وألوانك على أي تصميم تختاره.' },
  { icon:'fas fa-headset',     title:'دعم مستمر',    desc:'فريقنا متاح دائماً لمساعدتك في أي تعديل أو استفسار.' },
];

export default function PubgClient({ packages }: { packages: PubgPkg[] }) {
  const [active, setActive] = useState<PubgPkg | null>(null);

  return (
    <div dir="rtl" className="pg">
      <style>{`
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

        .pg {
          min-height:100vh;
          background:linear-gradient(180deg,#0F083B,#0C0516);
          color:#d0cce8; font-family:'29LtBukra','Montserrat',sans-serif;
        }

        /* ── Hero ── */
        .pg-hero {
          display:flex; flex-wrap:wrap; align-items:center;
          justify-content:space-around; padding:4rem 5%; gap:2rem;
        }
        .pg-hero-video {
          flex:1; min-width:300px; max-width:500px;
          border:1px solid rgba(84,22,181,0.35); border-radius:16px; overflow:hidden;
          box-shadow:0 4px 24px rgba(0,0,0,0.5);
        }
        .pg-hero-video video { width:100%; height:auto; display:block; }
        .pg-hero-content {
          flex:1; min-width:300px; max-width:500px; padding:1rem;
          display:flex; flex-direction:column; gap:0;
        }
        .pg-hero-tag {
          display:inline-flex; align-items:center; gap:7px; margin-bottom:18px;
          font-family:'29LtBukra','Montserrat',sans-serif; font-size:.65rem; font-weight:700;
          letter-spacing:3px; text-transform:uppercase; color:rgba(155,89,208,.75);
          padding:5px 16px; border-radius:20px;
          border:1px solid rgba(155,89,208,.2); background:rgba(84,22,181,.07);
          width:fit-content;
        }
        .pg-hero-tag i { font-size:.6rem; }
        .pg-hero-content h2 {
          font-family:'29LtBukra','Montserrat',sans-serif; font-size:clamp(1.9rem,3.5vw,2.7rem);
          font-weight:900; color:#eae6ff; line-height:1.25;
          margin-bottom:16px; letter-spacing:-.3px;
        }
        .pg-hero-content h2 span {
          background:linear-gradient(135deg,#9B59D0,#5416B5);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .pg-hero-content p {
          font-family:'29LtBukra','Montserrat',sans-serif; color:rgba(185,175,215,.5);
          font-size:.95rem; margin-bottom:28px; line-height:1.85;
        }
        .pg-hero-divider {
          width:40px; height:2px; border-radius:2px;
          background:linear-gradient(90deg,#5416B5,rgba(84,22,181,0)); margin-bottom:24px;
        }
        .pg-hero-cta {
          display:inline-flex; align-items:center; gap:10px;
          padding:.9rem 2.2rem; border-radius:50px;
          background:linear-gradient(135deg,#5416B5,#7F3AA1);
          color:#fff; font-family:'29LtBukra','Montserrat',sans-serif; font-weight:700; font-size:1rem;
          border:none; cursor:pointer; text-decoration:none; width:fit-content;
          box-shadow:0 6px 24px rgba(84,22,181,.4); transition:all .3s ease;
        }
        .pg-hero-cta:hover { transform:translateY(-3px); box-shadow:0 10px 32px rgba(84,22,181,.55); }
        .pg-hero-cta i { font-size:.85rem; transition:transform .3s; }
        .pg-hero-cta:hover i { transform:translateX(-4px); }
        @media(max-width:768px){
          .pg-hero { flex-direction:column; text-align:center; }
          .pg-hero-tag { margin-inline:auto; }
          .pg-hero-divider { margin-inline:auto; }
          .pg-hero-cta { margin-inline:auto; }
        }

        /* ── Ticker ── */
        .pg-ticker {
          margin:22px 0 0; height:38px; overflow:hidden; position:relative;
          border-top:1px solid rgba(84,22,181,0.12); border-bottom:1px solid rgba(84,22,181,0.12);
          background:rgba(84,22,181,0.03);
        }
        .pg-ticker::before,.pg-ticker::after {
          content:''; position:absolute; top:0; bottom:0; width:80px; z-index:2; pointer-events:none;
        }
        .pg-ticker::before { left:0; background:linear-gradient(90deg,#0C0516,transparent); }
        .pg-ticker::after  { right:0; background:linear-gradient(-90deg,#0C0516,transparent); }
        .pg-ticker-track {
          display:flex; align-items:center; height:100%;
          white-space:nowrap; width:max-content; animation:pgTick 32s linear infinite;
        }
        @keyframes pgTick { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .pg-ticker-item {
          display:inline-flex; align-items:center; gap:8px; padding:0 26px;
          font-size:.68rem; font-weight:600; letter-spacing:2.5px; text-transform:uppercase;
          color:rgba(170,155,205,0.35);
        }
        .pg-ticker-item i { color:rgba(84,22,181,0.5); font-size:.55rem; }
        .pg-ticker-dot { color:rgba(84,22,181,0.25); margin:0 4px; }

        /* ── Nav ── */
        .pg-nav { width:100%; padding:20px 5% 28px; }
        .pg-nav-row { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; direction:ltr; }
        .pg-nav-btn {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:8px; padding:18px 8px 16px; border-radius:16px;
          background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.07);
          color:rgba(175,165,208,0.5); font-family:'Montserrat','29LtBukra'; font-size:.78rem; font-weight:700;
          letter-spacing:.5px; text-transform:uppercase;
          text-decoration:none; position:relative; overflow:hidden;
          transition:all .3s cubic-bezier(.25,.8,.25,1);
        }
        .pg-nav-btn::before {
          content:''; position:absolute; inset:0;
          background:radial-gradient(ellipse at 50% 0%,rgba(84,22,181,0.12),transparent 70%);
          opacity:0; transition:opacity .3s;
        }
        .pg-nav-btn:hover::before { opacity:1; }
        .pg-nav-btn-icon {
          width:40px; height:40px; border-radius:12px;
          display:flex; align-items:center; justify-content:center;
          background:rgba(84,22,181,0.1); border:1px solid rgba(84,22,181,0.18);
          font-size:1.1rem; color:rgba(155,89,208,0.55); transition:all .3s; flex-shrink:0;
        }
        .pg-nav-btn:hover {
          background:rgba(84,22,181,0.07); border-color:rgba(155,89,208,0.28);
          color:#e2dcff; transform:translateY(-4px); box-shadow:0 10px 28px rgba(84,22,181,0.18);
        }
        .pg-nav-btn:hover .pg-nav-btn-icon {
          background:rgba(84,22,181,0.2); border-color:rgba(155,89,208,0.4);
          color:#9B59D0; transform:scale(1.08);
        }

        /* ── Stats ── */
        .pg-stats {
          display:flex; justify-content:center; flex-wrap:wrap; gap:0;
          background:rgba(15,8,59,0.6);
          border-top:1px solid rgba(84,22,181,0.18); border-bottom:1px solid rgba(84,22,181,0.18);
        }
        .pg-stat-item {
          flex:1; min-width:160px; padding:1.8rem 1rem;
          text-align:center; border-left:1px solid rgba(84,22,181,0.15);
        }
        .pg-stat-item:last-child { border-left:none; }
        .pg-stat-num {
          font-family:'Oxanium',sans-serif; font-size:1.8rem; font-weight:800;
          color:#9B59D0; display:block; margin-bottom:.3rem;
        }
        .pg-stat-label { color:rgba(170,155,200,0.65); font-size:.8rem; letter-spacing:1px; }
        @media(max-width:768px){
          .pg-stat-item { min-width:50%; border-left:none; border-bottom:1px solid rgba(84,22,181,0.1); padding:1.2rem .5rem; }
          .pg-stat-num { font-size:1.5rem; }
        }

        /* ── Section Head ── */
        .pg-head { text-align:center; padding:40px 16px 36px; }
        .pg-head-tag {
          display:inline-block; font-size:.62rem; font-weight:700; letter-spacing:4px;
          text-transform:uppercase; color:rgba(155,89,208,0.7);
          padding:5px 20px; border-radius:20px;
          border:1px solid rgba(155,89,208,0.18); background:rgba(84,22,181,0.06); margin-bottom:18px;
        }
        .pg-head h2 {
          font-family:'29LtBukra','Montserrat'; font-size:clamp(1.6rem,3.5vw,2.4rem);
          color:#eae6ff; font-weight:900; letter-spacing:.5px; margin-bottom:10px; line-height:1.3;
        }
        .pg-head h2 span { color:#9B59D0; }
        .pg-head p { font-size:.9rem; color:rgba(170,160,205,0.38); max-width:400px; margin:0 auto; line-height:1.7; }

        /* ── Grid ── */
        .pg-products {
          padding:0 5% 4rem;
          display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1.5rem;
        }

        /* ── Card ── */
        .pg-card {
          position:relative; border-radius:14px; overflow:hidden;
          background:rgba(15,8,59,0.5); border:1px solid rgba(84,22,181,0.2);
          box-shadow:0 4px 16px rgba(0,0,0,0.3); cursor:pointer; transition:all .3s ease; height:260px;
        }
        .pg-card:hover { transform:translateY(-6px); box-shadow:0 8px 24px rgba(84,22,181,0.25); border-color:rgba(84,22,181,0.5); }
        .pg-card img { width:100%; height:100%; object-fit:cover; display:block; image-rendering:-webkit-optimize-contrast; transition:transform .55s cubic-bezier(.25,.8,.25,1); }
        .pg-card:hover img { transform:scale(1.06); }
        .pg-card-grad {
          position:absolute; inset:0;
          background:linear-gradient(to top,rgba(4,1,14,0.96) 0%,rgba(4,1,14,0.5) 35%,rgba(4,1,14,0.05) 65%,transparent 100%);
          transition:background .3s;
        }
        .pg-card:hover .pg-card-grad {
          background:linear-gradient(to top,rgba(4,1,14,0.98) 0%,rgba(14,5,40,0.7) 45%,rgba(84,22,181,0.08) 70%,transparent 100%);
        }
        .pg-card-body { position:absolute; bottom:0; left:0; right:0; padding:18px 18px 16px; z-index:2; }
        .pg-card-name { font-family:'29LtBukra','Montserrat'; font-size:1.05rem; font-weight:700; color:#e8e4f8; margin-bottom:3px; }
        .pg-card-sub  { color:rgba(170,155,200,0.5); font-size:.78rem; font-weight:500; }
        .pg-card-badge {
          position:absolute; top:12px; right:12px; z-index:2;
          display:flex; align-items:center; gap:5px;
          padding:4px 10px; border-radius:20px;
          background:rgba(8,2,18,0.75); backdrop-filter:blur(10px);
          border:1px solid rgba(84,22,181,0.28);
          font-size:.6rem; font-weight:700; letter-spacing:1px;
          color:rgba(180,165,215,0.6); text-transform:uppercase;
        }
        .pg-card-badge i { font-size:.52rem; color:#7F3AA1; }

        /* Empty */
        .pg-empty { text-align:center; padding:80px 20px; color:rgba(170,155,205,0.4); grid-column:1/-1; }
        .pg-empty i { font-size:3rem; margin-bottom:16px; display:block; opacity:.3; }
        .pg-empty p { font-size:.9rem; }

        /* ── Features ── */
        .pg-features {
          padding:3rem 5%; display:grid;
          grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1.2rem;
          background:linear-gradient(180deg,#0C0516,#0F083B);
          border-top:1px solid rgba(84,22,181,0.15); border-bottom:1px solid rgba(84,22,181,0.15);
        }
        .pg-feature-card {
          background:rgba(15,8,59,0.5); border-radius:14px; padding:1.8rem 1.4rem;
          border:1px solid rgba(84,22,181,0.15); text-align:right;
          transition:border-color .3s, transform .3s;
        }
        .pg-feature-card:hover { border-color:rgba(127,58,161,0.5); transform:translateY(-4px); }
        .pg-feature-icon {
          width:44px; height:44px; border-radius:12px; margin-bottom:1rem;
          background:rgba(84,22,181,0.2); border:1px solid rgba(127,58,161,0.3);
          display:flex; align-items:center; justify-content:center; color:#9B59D0; font-size:1.1rem;
        }
        .pg-feature-title { font-weight:700; color:#e8e4f8; margin-bottom:.5rem; font-size:1rem; }
        .pg-feature-desc  { color:rgba(160,150,190,0.65); font-size:.82rem; line-height:1.6; }

        /* ── Contact Buttons ── */
        .pg-contact-btns { display:grid; grid-template-columns:repeat(2,1fr); gap:.6rem; padding:2rem 5%; }
        .pg-contact-btn {
          display:flex; align-items:center; gap:10px;
          padding:.9rem 1.2rem; border-radius:14px;
          font-weight:600; font-size:.88rem; color:#d0cce8;
          text-decoration:none; transition:all .3s ease;
          background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); backdrop-filter:blur(6px);
        }
        .pg-contact-btn-icon { width:36px; height:36px; border-radius:10px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:1.1rem; }
        .pg-contact-btn-text { display:flex; flex-direction:column; gap:1px; }
        .pg-contact-btn-title { font-size:.82rem; font-weight:700; color:#e8e4f8; }
        .pg-contact-btn-sub   { font-size:.68rem; color:rgba(180,170,210,0.5); font-weight:400; }
        .pg-contact-btn:hover { background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.14); transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.2); }

        /* ── Backdrop ── */
        .pg-backdrop { position:fixed; inset:0; z-index:300; background:rgba(0,0,0,0.6); backdrop-filter:blur(3px); animation:pgFade .25s ease; }
        @keyframes pgFade { from{opacity:0} to{opacity:1} }

        /* ── Drawer ── */
        .pg-detail {
          position:fixed; top:0; right:0; bottom:0;
          width:62%; max-width:760px; z-index:301;
          background:#0a0514; overflow-y:auto; overflow-x:hidden;
          padding-bottom:100px; animation:pgSlide .32s cubic-bezier(.25,.8,.25,1);
          box-shadow:-16px 0 60px rgba(0,0,0,0.75);
        }
        @keyframes pgSlide { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @media(max-width:768px){ .pg-detail{width:90%} }
        @media(max-width:480px){ .pg-detail{width:100%} }

        .pg-detail-bar {
          display:flex; align-items:center; gap:12px; padding:14px 20px;
          background:rgba(8,2,18,0.92); backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(84,22,181,0.14);
          position:sticky; top:0; z-index:10;
        }
        .pg-back {
          width:34px; height:34px; border-radius:50%; flex-shrink:0;
          display:inline-flex; align-items:center; justify-content:center;
          background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12);
          color:rgba(210,200,235,0.8); font-size:.8rem; cursor:pointer; transition:all .2s;
        }
        .pg-back:hover { background:rgba(255,255,255,0.14); color:#fff; transform:scale(1.1); }
        .pg-detail-name { font-family:'Oxanium'; font-size:clamp(.78rem,2vw,1rem); color:#e4e0f5; font-weight:800; flex:1; }
        .pg-detail-cnt  { font-size:.66rem; font-weight:700; letter-spacing:1.5px; color:rgba(155,89,208,0.65); white-space:nowrap; }

        .pg-detail-hero { position:relative; height:240px; overflow:hidden; background:#0a0514; }
        .pg-detail-hero-img { width:100%; height:100%; object-fit:cover; filter:brightness(0.3) blur(3px); transform:scale(1.06); }
        .pg-detail-hero-overlay { position:absolute; inset:0; background:linear-gradient(to top,#0a0514 0%,rgba(10,5,20,0.25) 55%,transparent 100%); }
        .pg-detail-hero-content { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:20px; }
        .pg-detail-hero-tag {
          font-size:.62rem; font-weight:700; letter-spacing:3px; text-transform:uppercase;
          color:rgba(155,89,208,0.75); padding:4px 14px; border-radius:20px;
          border:1px solid rgba(155,89,208,0.3); background:rgba(84,22,181,0.12);
        }
        .pg-detail-hero-title { font-family:'Oxanium'; font-size:clamp(1.1rem,3vw,1.9rem); font-weight:900; color:#fff; text-align:center; text-shadow:0 0 40px rgba(155,89,208,0.5); letter-spacing:1px; }
        .pg-detail-hero-sub { font-size:clamp(.72rem,1.6vw,.88rem); color:rgba(200,190,225,0.55); font-weight:600; }
        @media(max-width:480px){ .pg-detail-hero{height:180px} }

        .pg-pkg-video { width:100%; background:#000; line-height:0; }
        .pg-pkg-video iframe { width:100%; display:block; max-height:70vh; }
        .pg-pkg-video-label {
          padding:10px 20px; background:rgba(84,22,181,0.08); border-bottom:1px solid rgba(84,22,181,0.12);
          font-size:.75rem; font-weight:700; letter-spacing:2px; text-transform:uppercase;
          color:rgba(155,89,208,0.6); display:flex; align-items:center; gap:8px;
        }

        .pg-imgs { display:flex; flex-direction:column; gap:0; }
        .pg-img-wrap { width:100%; overflow:hidden; background:#0a0514; line-height:0; }
        .pg-img-wrap img { width:100%; height:auto; display:block; image-rendering:-webkit-optimize-contrast; }
        .pg-img-sep { height:2px; background:linear-gradient(90deg,transparent,rgba(84,22,181,0.3),transparent); }

        /* ── Contacts Panel ── */
        .pg-contacts-panel {
          position:fixed; top:0; left:0; bottom:0; width:38%; z-index:302;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:40px 32px; animation:pgFade .35s ease; pointer-events:none;
        }
        .pg-close-btn {
          position:absolute; top:20px; left:50%; transform:translateX(-50%);
          width:36px; height:36px; border-radius:50%;
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
          color:rgba(200,185,230,0.5); display:flex; align-items:center; justify-content:center;
          font-size:.8rem; cursor:pointer; pointer-events:all; transition:all .2s;
        }
        .pg-close-btn:hover { background:rgba(255,255,255,0.1); color:rgba(220,210,245,0.9); }
        .pg-contacts-inner { width:100%; max-width:320px; pointer-events:all; }
        .pg-order-label {
          font-size:.62rem; font-weight:700; letter-spacing:4px; text-transform:uppercase;
          color:rgba(155,89,208,0.4); margin-bottom:24px; text-align:center;
          display:flex; align-items:center; justify-content:center; gap:10px;
        }
        .pg-order-label::before,.pg-order-label::after { content:''; width:28px; height:1px; background:rgba(155,89,208,0.3); display:block; }
        .pg-contacts-list { display:flex; flex-direction:column; gap:12px; }
        .pg-contact {
          display:flex; align-items:center; gap:16px; padding:17px 20px; border-radius:16px;
          background:rgba(10,4,22,0.72); border:1px solid rgba(84,22,181,0.2); color:#d0cce8; text-decoration:none;
          transition:all .25s cubic-bezier(.25,.8,.25,1); backdrop-filter:blur(16px); box-shadow:0 4px 20px rgba(0,0,0,0.3);
        }
        .pg-contact:hover { background:rgba(22,8,50,0.88); border-color:rgba(155,89,208,0.45); transform:translateY(-3px) scale(1.02); box-shadow:0 12px 36px rgba(84,22,181,0.28); }
        .pg-contact-icon { width:50px; height:50px; border-radius:14px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:1.45rem; }
        .pg-contact-text { flex:1; }
        .pg-contact-label { font-size:.98rem; font-weight:800; color:#ece8ff; margin-bottom:3px; }
        .pg-contact-sub   { font-size:.7rem; color:rgba(170,160,205,0.35); line-height:1.4; }
        .pg-contact-arrow { color:rgba(155,89,208,0.22); font-size:.78rem; transition:all .25s; }
        .pg-contact:hover .pg-contact-arrow { color:rgba(155,89,208,0.7); transform:translateX(-4px); }
        @media(max-width:768px){ .pg-contacts-panel{display:none} }

        /* ── Responsive ── */
        @media(max-width:1024px){ .pg-products { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:768px){
          .pg-nav-row { gap:8px; }
          .pg-nav-btn { padding:22px 8px 18px; gap:10px; border-radius:16px; font-size:.85rem; }
          .pg-nav-btn-icon { width:44px; height:44px; font-size:1.2rem; border-radius:13px; }
          .pg-products { grid-template-columns:repeat(2,1fr); padding:0 4% 3rem; gap:1rem; }
          .pg-contact-btns { grid-template-columns:1fr; padding:1.5rem 5%; }
          .pg-features { padding:2.5rem 4%; gap:1rem; }
        }
        @media(max-width:480px){
          .pg-products { grid-template-columns:1fr; }
          .pg-nav-row { grid-template-columns:repeat(2,1fr); }
          .pg-card { height:220px; }
        }
        @media(hover:none){ .pg-card:hover{transform:none} .pg-contact:hover{transform:none} }
      `}</style>

      {/* Hero */}
      <section className="pg-hero">
        <div className="pg-hero-video">
          <video autoPlay muted loop playsInline>
            <source src="https://res.cloudinary.com/v6vo90hw/video/upload/v1784782950/tilago/tilago.mp4" type="video/mp4"/>
          </video>
        </div>
        <div className="pg-hero-content">
          <div className="pg-hero-tag"><i className="fas fa-trophy"/> PUBG Championship</div>
          <h2>بطولات <span>PUBG</span> من Tilago</h2>
          <div className="pg-hero-divider"/>
          <p>تصاميم بطولية احترافية لفرق PUBG — شعارات، أوفرلاي، براكيت، وشاشات الفوز. كل شيء مخصص لفريقك.</p>
          <a href="#packages" className="pg-hero-cta">تصفح الباكدجات <i className="fas fa-arrow-left"/></a>
        </div>
      </section>

      {/* Ticker */}
      <div className="pg-ticker">
        <div className="pg-ticker-track">
          {[...TICKER_WORDS,...TICKER_WORDS].map((w,i)=>(
            <span key={i} className="pg-ticker-item">
              <i className="fas fa-trophy"/>{w}
              <span className="pg-ticker-dot">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="pg-nav">
        <div className="pg-nav-row">
          <Link href="/3d"           className="pg-nav-btn"><div className="pg-nav-btn-icon"><i className="fas fa-cube"/></div>3D</Link>
          <Link href="/alerts"       className="pg-nav-btn"><div className="pg-nav-btn-icon"><i className="fas fa-bell"/></div>Alerts</Link>
          <Link href="/stream"       className="pg-nav-btn"><div className="pg-nav-btn-icon"><i className="fas fa-video"/></div>Stream</Link>
          <Link href="/esports/tdm"  className="pg-nav-btn"><div className="pg-nav-btn-icon"><i className="fas fa-crosshairs"/></div>TDM</Link>
        </div>
      </nav>

      {/* Stats */}
      {!active && (
        <div className="pg-stats">
          {[
            { num: packages.length > 0 ? `+${packages.length}` : '0', label:'باكدج جاهز' },
            { num:'50+',  label:'فريق مصمم' },
            { num:'24h',  label:'وقت التسليم' },
            { num:'100%', label:'مخصص لفريقك' },
          ].map(s=>(
            <div key={s.label} className="pg-stat-item">
              <span className="pg-stat-num">{s.num}</span>
              <span className="pg-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {!active && (
        <>
          <div className="pg-head" id="packages">
            <span className="pg-head-tag">PUBG Championship</span>
            <h2>باكدجات <span>البطولة</span></h2>
            <p>اضغط على أي باكدج لمشاهدة تفاصيله وكل ما يحتويه</p>
          </div>

          <div className="pg-products">
            {packages.length === 0 ? (
              <div className="pg-empty">
                <i className="fas fa-trophy"/>
                <p>لا توجد باكدجات متاحة حالياً</p>
              </div>
            ) : packages.map(pkg=>(
              <div key={pkg.id} className="pg-card" onClick={()=>setActive(pkg)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {pkg.cover && <img src={pkg.cover} alt={pkg.nameAr}/>}
                <div className="pg-card-grad"/>
                <div className="pg-card-badge">
                  <i className="fas fa-trophy"/>
                  {pkg.images.length} عنصر
                </div>
                <div className="pg-card-body">
                  <div className="pg-card-name">{pkg.nameAr}</div>
                  {pkg.name && pkg.name !== pkg.nameAr && <div className="pg-card-sub">{pkg.name}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Features */}
          <section className="pg-features">
            {FEATURES.map(f=>(
              <div key={f.title} className="pg-feature-card">
                <div className="pg-feature-icon"><i className={f.icon}/></div>
                <div className="pg-feature-title">{f.title}</div>
                <div className="pg-feature-desc">{f.desc}</div>
              </div>
            ))}
          </section>

          {/* Contact */}
          <div className="pg-contact-btns" style={{maxWidth:'580px',margin:'0 auto'}}>
            {CONTACTS.map(btn=>(
              <a key={btn.label} href={btn.href} target="_blank" rel="noreferrer" className="pg-contact-btn">
                <div className="pg-contact-btn-icon" style={{background:`${btn.c}18`,color:btn.c}}>
                  <i className={btn.icon}/>
                </div>
                <div className="pg-contact-btn-text">
                  <span className="pg-contact-btn-title">{btn.label}</span>
                  <span className="pg-contact-btn-sub">تواصل معنا</span>
                </div>
              </a>
            ))}
          </div>
        </>
      )}

      {/* Detail Drawer */}
      {active && (
        <>
          <div className="pg-backdrop" onClick={()=>setActive(null)}/>

          <div className="pg-contacts-panel">
            <button className="pg-close-btn" onClick={()=>setActive(null)}>
              <i className="fas fa-times"/>
            </button>
            <div className="pg-contacts-inner">
              <div className="pg-order-label">تواصل للطلب</div>
              <div className="pg-contacts-list">
                {CONTACTS.map(b=>(
                  <a key={b.label} href={b.href} target="_blank" rel="noreferrer" className="pg-contact">
                    <div className="pg-contact-icon" style={{background:`${b.c}15`,color:b.c}}>
                      <i className={b.icon}/>
                    </div>
                    <div className="pg-contact-text">
                      <div className="pg-contact-label">{b.label}</div>
                      <div className="pg-contact-sub">{b.sub}</div>
                    </div>
                    <i className="fas fa-chevron-left pg-contact-arrow"/>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="pg-detail">
            <div className="pg-detail-bar">
              <div className="pg-detail-name">{active.nameAr}</div>
              <div className="pg-detail-cnt">{active.images.length} عنصر</div>
              <button className="pg-back" onClick={()=>setActive(null)}>
                <i className="fas fa-times"/>
              </button>
            </div>

            <div className="pg-detail-hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {active.cover && <img className="pg-detail-hero-img" src={active.cover} alt={active.nameAr}/>}
              <div className="pg-detail-hero-overlay"/>
              <div className="pg-detail-hero-content">
                <div className="pg-detail-hero-tag">PUBG Championship</div>
                <div className="pg-detail-hero-title">{active.nameAr}</div>
                {active.name && active.name !== active.nameAr && (
                  <div className="pg-detail-hero-sub">{active.name}</div>
                )}
              </div>
            </div>

            {youtubeEmbedUrl(active.video) && (
              <div className="pg-pkg-video">
                <div className="pg-pkg-video-label"><i className="fas fa-play-circle"/> معاينة الباكدج</div>
                <iframe src={youtubeEmbedUrl(active.video, { loop: true })!} title={active.nameAr}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen style={{ width:'100%', aspectRatio:'16/9', display:'block', border:'none' }}/>
              </div>
            )}

            <div className="pg-imgs">
              {active.images.map((src,i)=>(
                <div key={i}>
                  {i > 0 && <div className="pg-img-sep"/>}
                  <div className="pg-img-wrap">
                    {isYouTubeUrl(src) ? (
                      <iframe src={youtubeEmbedUrl(src)!} title={`${active.nameAr} ${i+1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen style={{ width:'100%', aspectRatio:'16/9', display:'block', border:'none' }}/>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt={`${active.nameAr} ${i+1}`}/>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

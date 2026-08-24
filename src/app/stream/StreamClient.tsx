'use client';

import Link from 'next/link';
import { useState } from 'react';
import { youtubeEmbedUrl } from '@/lib/youtube';
import { mediaKind, videoPoster } from '@/lib/media';
import { InlineVideo } from '@/components/InlineVideo';

export interface StreamPkg {
  id: string;
  name: string;
  nameAr: string;
  cover: string;
  images: string[];
  video?: string;
  available?: boolean;
}

const CONTACTS = [
  { icon:'fab fa-whatsapp', label:'واتساب',      sub:'اطلب الآن مباشرةً',       href:'https://wa.me/1234567890',       c:'#25D366' },
  { icon:'fab fa-telegram', label:'تيليجرام',    sub:'تواصل معنا على تيليجرام',  href:'https://t.me/yourchannel',       c:'#0088cc' },
  { icon:'fab fa-discord',  label:'ديسكورد',     sub:'انضم لسيرفر الدعم',        href:'https://discord.gg/yourserver',  c:'#5865F2' },
  { icon:'fas fa-headset',  label:'الدعم الفني', sub:'نرد خلال 24 ساعة',         href:'mailto:support@tilago.com',      c:'#9B59D0' },
];

const TICKER_WORDS = ['Stream Pack','Logo','Overlay','Facecam Frame','Alert','Starting Screen','Ending Screen','Intro Video'];

const FEATURES = [
  { icon:'fas fa-layer-group', title:'باكدج متكامل',  desc:'كل ما تحتاجه لقناتك — أوفرلاي، يرتات، شاشات بدء وإنهاء في مكان واحد.' },
  { icon:'fas fa-bolt',        title:'تسليم سريع',    desc:'تستلم الباكدج كاملاً خلال 24 ساعة من وقت الطلب.' },
  { icon:'fas fa-sliders-h',   title:'تخصيص كامل',   desc:'أضف اسمك وشعارك وألوانك المفضلة على أي تصميم تختاره.' },
  { icon:'fas fa-headset',     title:'دعم مستمر',    desc:'فريقنا متاح دائماً لمساعدتك في الإعداد على OBS وStreamlabs.' },
];

export default function StreamClient({ packages }: { packages: StreamPkg[] }) {
  const [active, setActive] = useState<StreamPkg | null>(null);

  return (
    <div dir="rtl" className="sp">
      <style>{`
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

        .sp {
          min-height:100vh;
          background:linear-gradient(180deg,#0F083B,#0C0516);
          color:#d0cce8; font-family:'29LtBukra','Montserrat',sans-serif;
        }

        /* ── Hero ── */
        .sp-hero {
          display:flex; flex-wrap:wrap; align-items:center;
          justify-content:space-around; padding:4rem 5%; gap:2rem;
        }
        .sp-hero-video {
          flex:1; min-width:300px; max-width:500px;
          border:1px solid rgba(84,22,181,0.35); border-radius:16px; overflow:hidden;
          box-shadow:0 4px 24px rgba(0,0,0,0.5);
        }
        .sp-hero-video video { width:100%; height:auto; display:block; }
        .sp-hero-content {
          flex:1; min-width:300px; max-width:500px; padding:1rem;
          display:flex; flex-direction:column; gap:0;
        }
        .sp-hero-tag {
          display:inline-flex; align-items:center; gap:7px; margin-bottom:18px;
          font-family:'29LtBukra','Montserrat',sans-serif; font-size:.65rem; font-weight:700;
          letter-spacing:3px; text-transform:uppercase; color:rgba(155,89,208,.75);
          padding:5px 16px; border-radius:20px;
          border:1px solid rgba(155,89,208,.2); background:rgba(84,22,181,.07);
          width:fit-content;
        }
        .sp-hero-tag i { font-size:.6rem; }
        .sp-hero-content h2 {
          font-family:'29LtBukra','Montserrat',sans-serif; font-size:clamp(1.9rem,3.5vw,2.7rem);
          font-weight:900; color:#eae6ff; line-height:1.25;
          margin-bottom:16px; letter-spacing:-.3px;
        }
        .sp-hero-content h2 span {
          background:linear-gradient(135deg,#9B59D0,#5416B5);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .sp-hero-content p {
          font-family:'29LtBukra','Montserrat',sans-serif; color:rgba(185,175,215,.5);
          font-size:.95rem; margin-bottom:28px; line-height:1.85;
        }
        .sp-hero-divider {
          width:40px; height:2px; border-radius:2px;
          background:linear-gradient(90deg,#5416B5,rgba(84,22,181,0)); margin-bottom:24px;
        }
        .sp-hero-cta {
          display:inline-flex; align-items:center; gap:10px;
          padding:.9rem 2.2rem; border-radius:50px;
          background:linear-gradient(135deg,#5416B5,#7F3AA1);
          color:#fff; font-family:'29LtBukra','Montserrat',sans-serif; font-weight:700; font-size:1rem;
          border:none; cursor:pointer; text-decoration:none; width:fit-content;
          box-shadow:0 6px 24px rgba(84,22,181,.4); transition:all .3s ease;
        }
        .sp-hero-cta:hover { transform:translateY(-3px); box-shadow:0 10px 32px rgba(84,22,181,.55); }
        .sp-hero-cta i { font-size:.85rem; transition:transform .3s; }
        .sp-hero-cta:hover i { transform:translateX(-4px); }
        @media(max-width:768px){
          .sp-hero { flex-direction:column; text-align:center; }
          .sp-hero-tag { margin-inline:auto; }
          .sp-hero-divider { margin-inline:auto; }
          .sp-hero-cta { margin-inline:auto; }
        }

        /* ── Ticker ── */
        .sp-ticker {
          margin:22px 0 0; height:38px; overflow:hidden; position:relative;
          border-top:1px solid rgba(84,22,181,0.12); border-bottom:1px solid rgba(84,22,181,0.12);
          background:rgba(84,22,181,0.03);
        }
        .sp-ticker::before,.sp-ticker::after {
          content:''; position:absolute; top:0; bottom:0; width:80px; z-index:2; pointer-events:none;
        }
        .sp-ticker::before { left:0; background:linear-gradient(90deg,#0C0516,transparent); }
        .sp-ticker::after  { right:0; background:linear-gradient(-90deg,#0C0516,transparent); }
        .sp-ticker-track {
          display:flex; align-items:center; height:100%;
          white-space:nowrap; width:max-content; animation:spTick 32s linear infinite;
        }
        @keyframes spTick { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .sp-ticker-item {
          display:inline-flex; align-items:center; gap:8px; padding:0 26px;
          font-size:.68rem; font-weight:600; letter-spacing:2.5px; text-transform:uppercase;
          color:rgba(170,155,205,0.35);
        }
        .sp-ticker-item i { color:rgba(84,22,181,0.5); font-size:.55rem; }
        .sp-ticker-dot { color:rgba(84,22,181,0.25); margin:0 4px; }

        /* ── Nav ── */
        .sp-nav { max-width:1100px; margin:0 auto; padding:28px 24px 36px; }
        .sp-nav-row { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
        @media(max-width:640px){ .sp-nav-row { grid-template-columns:repeat(2,1fr); } }
        .sp-nav-btn {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:12px; padding:28px 12px 24px; border-radius:20px;
          background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.07);
          color:rgba(175,165,208,0.5); font-family:'29LtBukra','Montserrat'; font-size:.95rem; font-weight:700;
          text-decoration:none; position:relative; overflow:hidden;
          transition:all .3s cubic-bezier(.25,.8,.25,1);
        }
        .sp-nav-btn::before {
          content:''; position:absolute; inset:0;
          background:radial-gradient(ellipse at 50% 0%,rgba(84,22,181,0.12),transparent 70%);
          opacity:0; transition:opacity .3s;
        }
        .sp-nav-btn:hover::before { opacity:1; }
        .sp-nav-btn-icon {
          width:52px; height:52px; border-radius:16px;
          display:flex; align-items:center; justify-content:center;
          background:rgba(84,22,181,0.1); border:1px solid rgba(84,22,181,0.18);
          font-size:1.4rem; color:rgba(155,89,208,0.55); transition:all .3s; flex-shrink:0;
        }
        .sp-nav-btn:hover {
          background:rgba(84,22,181,0.07); border-color:rgba(155,89,208,0.28);
          color:#e2dcff; transform:translateY(-5px); box-shadow:0 14px 36px rgba(84,22,181,0.18);
        }
        .sp-nav-btn:hover .sp-nav-btn-icon {
          background:rgba(84,22,181,0.2); border-color:rgba(155,89,208,0.4);
          color:#9B59D0; transform:scale(1.08);
        }

        /* ── Stats ── */
        .sp-stats {
          display:flex; justify-content:center; flex-wrap:wrap; gap:0;
          background:rgba(15,8,59,0.6);
          border-top:1px solid rgba(84,22,181,0.18); border-bottom:1px solid rgba(84,22,181,0.18);
        }
        .sp-stat-item {
          flex:1; min-width:160px; padding:1.8rem 1rem;
          text-align:center; border-left:1px solid rgba(84,22,181,0.15);
        }
        .sp-stat-item:last-child { border-left:none; }
        .sp-stat-num {
          font-family:'Oxanium',sans-serif; font-size:1.8rem; font-weight:800;
          color:#9B59D0; display:block; margin-bottom:.3rem;
        }
        .sp-stat-label { color:rgba(170,155,200,0.65); font-size:.8rem; letter-spacing:1px; }
        @media(max-width:768px){
          .sp-stat-item { min-width:50%; border-left:none; border-bottom:1px solid rgba(84,22,181,0.1); padding:1.2rem .5rem; }
          .sp-stat-num { font-size:1.5rem; }
        }

        /* ── Section Head ── */
        .sp-head { text-align:center; padding:40px 16px 36px; position:relative; }
        .sp-head-tag {
          display:inline-block; font-size:.62rem; font-weight:700; letter-spacing:4px;
          text-transform:uppercase; color:rgba(155,89,208,0.7);
          padding:5px 20px; border-radius:20px;
          border:1px solid rgba(155,89,208,0.18); background:rgba(84,22,181,0.06); margin-bottom:18px;
        }
        .sp-head h2 {
          font-family:'29LtBukra','Montserrat'; font-size:clamp(1.6rem,3.5vw,2.4rem);
          color:#eae6ff; font-weight:900; letter-spacing:.5px; margin-bottom:10px; line-height:1.3;
        }
        .sp-head h2 span { color:#9B59D0; }
        .sp-head p { font-size:.9rem; color:rgba(170,160,205,0.38); max-width:400px; margin:0 auto; line-height:1.7; }

        /* ── Products Grid ── */
        .sp-products {
          padding:0 5% 4rem;
          display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:1.5rem;
        }

        /* ── Card ── */
        .sp-card {
          position:relative; border-radius:14px; overflow:hidden;
          background:rgba(15,8,59,0.5); border:1px solid rgba(84,22,181,0.2);
          box-shadow:0 4px 16px rgba(0,0,0,0.3); cursor:pointer; transition:all .3s ease; height:260px;
        }
        .sp-card:hover { transform:translateY(-6px); box-shadow:0 8px 24px rgba(84,22,181,0.25); border-color:rgba(84,22,181,0.5); }
        .sp-card img { width:100%; height:100%; object-fit:cover; display:block; image-rendering:-webkit-optimize-contrast; transition:transform .55s cubic-bezier(.25,.8,.25,1); }
        .sp-card:hover img { transform:scale(1.06); }
        /* باكدج غير متاح — مايتفتحش */
        .sp-card.sp-unavail { cursor:not-allowed; }
        .sp-card.sp-unavail:hover { transform:none; box-shadow:0 4px 16px rgba(0,0,0,0.3); border-color:rgba(84,22,181,0.2); }
        .sp-card.sp-unavail:hover img { transform:none; }
        .sp-card.sp-unavail img { filter:grayscale(.7) brightness(.5); }
        .sp-unavail-layer { position:absolute; inset:0; z-index:3; display:flex; align-items:center; justify-content:center;
          background:rgba(6,2,16,0.55); backdrop-filter:blur(1px); }
        .sp-unavail-badge { display:inline-flex; align-items:center; gap:8px; padding:.5rem 1.1rem; border-radius:50px;
          background:rgba(10,4,22,0.85); border:1px solid rgba(255,255,255,0.18); color:#f0ecff;
          font-family:'Cairo','29LtBukra',sans-serif; font-weight:700; font-size:.85rem; letter-spacing:.5px; }
        .sp-unavail-badge i { font-size:.78rem; opacity:.85; }
        .sp-card-grad {
          position:absolute; inset:0;
          background:linear-gradient(to top,rgba(4,1,14,0.96) 0%,rgba(4,1,14,0.5) 35%,rgba(4,1,14,0.05) 65%,transparent 100%);
          transition:background .3s;
        }
        .sp-card:hover .sp-card-grad {
          background:linear-gradient(to top,rgba(4,1,14,0.98) 0%,rgba(14,5,40,0.7) 45%,rgba(84,22,181,0.08) 70%,transparent 100%);
        }
        .sp-card-body { position:absolute; bottom:0; left:0; right:0; padding:18px 18px 16px; z-index:2; }
        .sp-card-name { font-family:'29LtBukra','Montserrat'; font-size:1.05rem; font-weight:700; color:#e8e4f8; margin-bottom:3px; }
        .sp-card-sub  { color:rgba(170,155,200,0.5); font-size:.78rem; font-weight:500; }
        .sp-card-count {
          position:absolute; top:12px; right:12px; z-index:2;
          display:flex; align-items:center; gap:5px;
          padding:4px 10px; border-radius:20px;
          background:rgba(8,2,18,0.75); backdrop-filter:blur(10px);
          border:1px solid rgba(84,22,181,0.28);
          font-size:.6rem; font-weight:700; letter-spacing:1px;
          color:rgba(180,165,215,0.6); text-transform:uppercase;
        }
        .sp-card-count i { font-size:.52rem; color:#7F3AA1; }

        /* Empty state */
        .sp-empty {
          text-align:center; padding:80px 20px; color:rgba(170,155,205,0.4);
        }
        .sp-empty i { font-size:3rem; margin-bottom:16px; display:block; opacity:.3; }
        .sp-empty p { font-size:.9rem; }

        /* ── Features ── */
        .sp-features {
          padding:3rem 5%; display:grid;
          grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1.2rem;
          background:linear-gradient(180deg,#0C0516,#0F083B);
          border-top:1px solid rgba(84,22,181,0.15); border-bottom:1px solid rgba(84,22,181,0.15);
        }
        .sp-feature-card {
          background:rgba(15,8,59,0.5); border-radius:14px; padding:1.8rem 1.4rem;
          border:1px solid rgba(84,22,181,0.15); text-align:right;
          transition:border-color .3s, transform .3s;
        }
        .sp-feature-card:hover { border-color:rgba(127,58,161,0.5); transform:translateY(-4px); }
        .sp-feature-icon {
          width:44px; height:44px; border-radius:12px; margin-bottom:1rem;
          background:rgba(84,22,181,0.2); border:1px solid rgba(127,58,161,0.3);
          display:flex; align-items:center; justify-content:center; color:#9B59D0; font-size:1.1rem;
        }
        .sp-feature-title { font-weight:700; color:#e8e4f8; margin-bottom:.5rem; font-size:1rem; }
        .sp-feature-desc  { color:rgba(160,150,190,0.65); font-size:.82rem; line-height:1.6; }

        /* ── Contact Buttons ── */
        .sp-contact-btns { display:grid; grid-template-columns:repeat(2,1fr); gap:.6rem; padding:2rem 5%; }
        .sp-contact-btn {
          display:flex; align-items:center; gap:10px;
          padding:.9rem 1.2rem; border-radius:14px;
          font-weight:600; font-size:.88rem; color:#d0cce8;
          text-decoration:none; transition:all .3s ease;
          background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); backdrop-filter:blur(6px);
        }
        .sp-contact-btn-icon { width:36px; height:36px; border-radius:10px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:1.1rem; }
        .sp-contact-btn-text { display:flex; flex-direction:column; gap:1px; }
        .sp-contact-btn-title { font-size:.82rem; font-weight:700; color:#e8e4f8; }
        .sp-contact-btn-sub   { font-size:.68rem; color:rgba(180,170,210,0.5); font-weight:400; }
        .sp-contact-btn:hover { background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.14); transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.2); }

        /* ── Drawer backdrop ── */
        .sp-drawer-backdrop { position:fixed; inset:0; z-index:300; background:rgba(0,0,0,0.6); backdrop-filter:blur(3px); animation:bdFadeIn .25s ease; }
        @keyframes bdFadeIn { from{opacity:0} to{opacity:1} }

        /* ── Detail drawer ── */
        .sp-detail {
          position:fixed; top:0; right:0; bottom:0;
          width:62%; max-width:760px; z-index:301;
          background:#0a0514; overflow-y:auto; overflow-x:hidden;
          padding-bottom:100px; animation:drawerIn .32s cubic-bezier(.25,.8,.25,1);
          box-shadow:-16px 0 60px rgba(0,0,0,0.75);
        }
        @keyframes drawerIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @media(max-width:768px){ .sp-detail{width:90%} }
        @media(max-width:480px){ .sp-detail{width:100%} }

        /* Top bar */
        .sp-detail-bar {
          display:flex; align-items:center; gap:12px; padding:14px 20px;
          background:rgba(8,2,18,0.92); backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(84,22,181,0.14);
          position:sticky; top:0; z-index:10;
        }
        .sp-back {
          display:inline-flex; align-items:center; justify-content:center;
          width:34px; height:34px; border-radius:50%; flex-shrink:0;
          background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12);
          color:rgba(210,200,235,0.8); font-size:.8rem; cursor:pointer; transition:all .2s;
        }
        .sp-back:hover { background:rgba(255,255,255,0.14); color:#fff; transform:scale(1.1); }
        .sp-detail-name { font-family:'Oxanium'; font-size:clamp(.78rem,2vw,1rem); color:#e4e0f5; font-weight:800; flex:1; }
        .sp-detail-cnt  { font-size:.66rem; font-weight:700; letter-spacing:1.5px; color:rgba(155,89,208,0.65); white-space:nowrap; }

        /* Cover hero */
        .sp-detail-hero { position:relative; height:240px; overflow:hidden; background:#0a0514; }
        .sp-detail-hero-img { width:100%; height:100%; object-fit:cover; filter:brightness(0.3) blur(3px); transform:scale(1.06); }
        .sp-detail-hero-overlay { position:absolute; inset:0; background:linear-gradient(to top,#0a0514 0%,rgba(10,5,20,0.25) 55%,transparent 100%); }
        .sp-detail-hero-content { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:20px; }
        .sp-detail-hero-tag {
          font-size:.62rem; font-weight:700; letter-spacing:3px; text-transform:uppercase;
          color:rgba(184,172,214,0.7); padding:4px 14px; border-radius:20px;
          border:1px solid rgba(155,89,208,0.18); background:rgba(84,22,181,0.07);
        }
        .sp-detail-hero-title { font-family:'Oxanium'; font-size:clamp(1.1rem,3vw,1.9rem); font-weight:800; color:#eae6ff; text-align:center; text-shadow:0 2px 10px rgba(0,0,0,0.55); letter-spacing:.4px; }
        .sp-detail-hero-sub { font-size:clamp(.72rem,1.6vw,.88rem); color:rgba(200,190,225,0.55); font-weight:600; }
        @media(max-width:480px){ .sp-detail-hero{height:180px} }

        /* Package video */
        .sp-pkg-video { width:100%; background:#000; line-height:0; }
        .sp-pkg-video iframe { width:100%; display:block; max-height:70vh; }
        .sp-pkg-video-label {
          padding:10px 20px; background:rgba(84,22,181,0.08); border-bottom:1px solid rgba(84,22,181,0.12);
          font-family:'Cairo','29LtBukra',sans-serif; font-size:.75rem; font-weight:700;
          letter-spacing:2px; text-transform:uppercase; color:rgba(155,89,208,0.6);
          display:flex; align-items:center; gap:8px;
        }

        /* Images */
        .sp-imgs { display:flex; flex-direction:column; gap:0; }
        .sp-img-wrap { width:100%; overflow:hidden; background:#0a0514; line-height:0; }
        .sp-img-wrap img { width:100%; height:auto; display:block; image-rendering:-webkit-optimize-contrast; }
        .sp-img-sep { height:2px; background:linear-gradient(90deg,transparent,rgba(84,22,181,0.3),transparent); }

        /* ── Contacts panel ── */
        .sp-contacts-panel {
          position:fixed; top:0; left:0; bottom:0; width:38%; z-index:302;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:40px 32px; animation:bdFadeIn .35s ease; pointer-events:none;
        }
        .sp-close-btn {
          position:absolute; top:20px; left:50%; transform:translateX(-50%);
          width:36px; height:36px; border-radius:50%;
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
          color:rgba(200,185,230,0.5); display:flex; align-items:center; justify-content:center;
          font-size:.8rem; cursor:pointer; pointer-events:all; transition:all .2s;
        }
        .sp-close-btn:hover { background:rgba(255,255,255,0.1); color:rgba(220,210,245,0.9); }
        .sp-contacts-inner { width:100%; max-width:320px; pointer-events:all; }
        .sp-order-label {
          font-size:.62rem; font-weight:700; letter-spacing:4px; text-transform:uppercase;
          color:rgba(155,89,208,0.4); margin-bottom:24px; text-align:center;
          display:flex; align-items:center; justify-content:center; gap:10px;
        }
        .sp-order-label::before,.sp-order-label::after { content:''; width:28px; height:1px; background:rgba(155,89,208,0.3); display:block; }
        .sp-contacts { display:flex; flex-direction:column; gap:12px; }
        .sp-contact {
          display:flex; align-items:center; gap:16px; padding:17px 20px; border-radius:16px;
          background:rgba(10,4,22,0.72); border:1px solid rgba(84,22,181,0.2); color:#d0cce8; text-decoration:none;
          transition:all .25s cubic-bezier(.25,.8,.25,1); backdrop-filter:blur(16px); box-shadow:0 4px 20px rgba(0,0,0,0.3);
        }
        .sp-contact:hover { background:rgba(22,8,50,0.88); border-color:rgba(155,89,208,0.45); transform:translateY(-3px) scale(1.02); box-shadow:0 12px 36px rgba(84,22,181,0.28); }
        .sp-contact-icon { width:50px; height:50px; border-radius:14px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:1.45rem; }
        .sp-contact-text { flex:1; }
        .sp-contact-label { font-size:.98rem; font-weight:800; color:#ece8ff; margin-bottom:3px; }
        .sp-contact-sub   { font-size:.7rem; color:rgba(170,160,205,0.35); line-height:1.4; }
        .sp-contact-arrow { color:rgba(155,89,208,0.22); font-size:.78rem; transition:all .25s; }
        .sp-contact:hover .sp-contact-arrow { color:rgba(155,89,208,0.7); transform:translateX(-4px); }
        @media(max-width:768px){ .sp-contacts-panel{display:none} }

        /* ── Responsive ── */
        @media(max-width:1024px){ .sp-products { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:768px){
          .sp-nav-row { gap:8px; }
          .sp-nav-btn { padding:22px 8px 18px; gap:10px; border-radius:16px; font-size:.85rem; }
          .sp-nav-btn-icon { width:44px; height:44px; font-size:1.2rem; border-radius:13px; }
          .sp-products { grid-template-columns:repeat(2,1fr); padding:0 4% 3rem; gap:1rem; }
          .sp-contact-btns { grid-template-columns:1fr; padding:1.5rem 5%; }
          .sp-features { padding:2.5rem 4%; gap:1rem; }
        }
        @media(max-width:480px){
          .sp-products { grid-template-columns:1fr; }
          .sp-nav-row { grid-template-columns:repeat(2,1fr); }
          .sp-card { height:220px; }
        }
        @media(hover:none){ .sp-card:hover{transform:none} .sp-contact:hover{transform:none} }
      `}</style>

      {/* Hero */}
      <section className="sp-hero">
        <div className="sp-hero-video">
          <video autoPlay muted loop playsInline>
            <source src="https://res.cloudinary.com/v6vo90hw/video/upload/v1784782950/tilago/tilago.mp4" type="video/mp4"/>
          </video>
        </div>
        <div className="sp-hero-content">
          <div className="sp-hero-tag"><i className="fas fa-layer-group"/> Stream Packages</div>
          <h2>أفضل باكدجات <span>ستريم</span> من Tilago</h2>
          <div className="sp-hero-divider"/>
          <p>باكدجات جاهزة ومصممة باحترافية لقنوات البث المباشر — أوفرلاي، يرتات، شاشات بدء وإنهاء، وأكثر. كل شيء مخصص لك.</p>
          <a href="#packages" className="sp-hero-cta">تصفح الآن <i className="fas fa-arrow-left"/></a>
        </div>
      </section>

      {/* Ticker */}
      <div className="sp-ticker">
        <div className="sp-ticker-track">
          {[...TICKER_WORDS,...TICKER_WORDS].map((w,i)=>(
            <span key={i} className="sp-ticker-item">
              <i className="fas fa-layer-group"/>{w}
              <span className="sp-ticker-dot">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="sp-nav">
        <div className="sp-nav-row">
          <Link href="/3d"     className="sp-nav-btn"><div className="sp-nav-btn-icon"><i className="fas fa-cube"/></div>ثري دي</Link>
          <Link href="/video"  className="sp-nav-btn"><div className="sp-nav-btn-icon"><i className="fas fa-film"/></div>فيديو</Link>
          <Link href="/stream" className="sp-nav-btn"><div className="sp-nav-btn-icon"><i className="fas fa-video"/></div>ستريم</Link>
          <Link href="/alerts" className="sp-nav-btn"><div className="sp-nav-btn-icon"><i className="fas fa-bell"/></div>اليرت</Link>
        </div>
      </nav>

      {/* Stats */}
      {!active && (
        <div className="sp-stats">
          {[
            { num: packages.length > 0 ? `+${packages.length}` : '0', label:'باكدج جاهز' },
            { num:'100+',  label:'عنصر تصميم' },
            { num:'24h',   label:'وقت التسليم' },
            { num:'100%',  label:'مخصص لك' },
          ].map(s=>(
            <div key={s.label} className="sp-stat-item">
              <span className="sp-stat-num">{s.num}</span>
              <span className="sp-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* LIST */}
      {!active && (
        <>
          <div className="sp-head" id="packages">
            <span className="sp-head-tag">Stream Packages</span>
            <h2>باكدجات <span>الستريم</span></h2>
            <p>اضغط على أي باكدج لمشاهدة تفاصيله وكل ما يحتويه</p>
          </div>

          <div className="sp-products">
            {packages.length === 0 ? (
              <div className="sp-empty" style={{ gridColumn:'1/-1' }}>
                <i className="fas fa-layer-group"/>
                <p>لا توجد باكدجات متاحة حالياً</p>
              </div>
            ) : packages.map(pkg=>{
              const unavailable = pkg.available === false;
              return (
              <div key={pkg.id} className={`sp-card${unavailable ? ' sp-unavail' : ''}`}
                onClick={()=>{ if (!unavailable) setActive(pkg); }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {pkg.cover && <img src={pkg.cover} alt={pkg.nameAr}/>}
                <div className="sp-card-grad"/>
                {unavailable && (
                  <div className="sp-unavail-layer">
                    <span className="sp-unavail-badge"><i className="fas fa-lock"/> غير متاح</span>
                  </div>
                )}
                <div className="sp-card-count">
                  <i className="fas fa-layer-group"/>
                  {pkg.images.length} عنصر
                </div>
                <div className="sp-card-body">
                  <div className="sp-card-name">{pkg.nameAr}</div>
                  {pkg.name && pkg.name !== pkg.nameAr && <div className="sp-card-sub">{pkg.name}</div>}
                </div>
              </div>
              );
            })}
          </div>

          {/* Features */}
          <section className="sp-features">
            {FEATURES.map(f=>(
              <div key={f.title} className="sp-feature-card">
                <div className="sp-feature-icon"><i className={f.icon}/></div>
                <div className="sp-feature-title">{f.title}</div>
                <div className="sp-feature-desc">{f.desc}</div>
              </div>
            ))}
          </section>

          {/* Contact */}
          <div className="sp-contact-btns" style={{maxWidth:'580px',margin:'0 auto'}}>
            {CONTACTS.map(btn=>(
              <a key={btn.label} href={btn.href} target="_blank" rel="noreferrer" className="sp-contact-btn">
                <div className="sp-contact-btn-icon" style={{background:`${btn.c}18`,color:btn.c}}>
                  <i className={btn.icon}/>
                </div>
                <div className="sp-contact-btn-text">
                  <span className="sp-contact-btn-title">{btn.label}</span>
                  <span className="sp-contact-btn-sub">تواصل معنا</span>
                </div>
              </a>
            ))}
          </div>
        </>
      )}

      {/* DETAIL DRAWER */}
      {active && (
        <>
          <div className="sp-drawer-backdrop" onClick={()=>setActive(null)}/>

          <div className="sp-contacts-panel">
            <button className="sp-close-btn" onClick={()=>setActive(null)}>
              <i className="fas fa-times"/>
            </button>
            <div className="sp-contacts-inner">
              <div className="sp-order-label">تواصل للطلب</div>
              <div className="sp-contacts">
                {CONTACTS.map(b=>(
                  <a key={b.label} href={b.href} target="_blank" rel="noreferrer" className="sp-contact">
                    <div className="sp-contact-icon" style={{background:`${b.c}15`,color:b.c}}>
                      <i className={b.icon}/>
                    </div>
                    <div className="sp-contact-text">
                      <div className="sp-contact-label">{b.label}</div>
                      <div className="sp-contact-sub">{b.sub}</div>
                    </div>
                    <i className="fas fa-chevron-left sp-contact-arrow"/>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="sp-detail">
            <div className="sp-detail-bar">
              <div className="sp-detail-name">{active.nameAr}</div>
              <div className="sp-detail-cnt">{active.images.length} عنصر</div>
              <button className="sp-back" onClick={()=>setActive(null)}>
                <i className="fas fa-times"/>
              </button>
            </div>

            <div className="sp-detail-hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {active.cover && <img className="sp-detail-hero-img" src={active.cover} alt={active.nameAr}/>}
              <div className="sp-detail-hero-overlay"/>
              <div className="sp-detail-hero-content">
                <div className="sp-detail-hero-tag">Stream Package</div>
                <div className="sp-detail-hero-title">{active.nameAr}</div>
                {active.name && active.name !== active.nameAr && (
                  <div className="sp-detail-hero-sub">{active.name}</div>
                )}
              </div>
            </div>

            {/* فيديو المعاينة العلوي — يظهر فقط لو مش مضاف ضمن الصور (باكدجات قديمة) */}
            {active.video && youtubeEmbedUrl(active.video) && !active.images.includes(active.video) && (
              <div className="sp-pkg-video">
                <div className="sp-pkg-video-label"><i className="fas fa-play-circle"/> معاينة الباكدج</div>
                <iframe src={youtubeEmbedUrl(active.video, { loop: true })!} title={active.nameAr}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen style={{ width:'100%', aspectRatio:'16/9', display:'block', border:'none' }}/>
              </div>
            )}

            <div className="sp-imgs">
              {active.images.map((src,i)=>{
                const kind = mediaKind(src);
                return (
                <div key={i}>
                  {i > 0 && <div className="sp-img-sep"/>}
                  <div className="sp-img-wrap">
                    {kind === 'youtube' ? (
                      <iframe src={youtubeEmbedUrl(src)!} title={`${active.nameAr} ${i+1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen style={{ width:'100%', aspectRatio:'16/9', display:'block', border:'none' }}/>
                    ) : kind === 'video' ? (
                      <InlineVideo src={src} poster={videoPoster(src)} />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt={`${active.nameAr} ${i+1}`}/>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

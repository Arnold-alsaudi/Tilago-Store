'use client';

import Link from 'next/link';
import { useState } from 'react';

export interface TdmPkg {
  id: string;
  name: string;
  nameAr: string;
  cover: string;
  images: string[];
  video?: string;
}

const CONTACTS = [
  { icon:'fab fa-whatsapp', label:'ظˆط§طھط³ط§ط¨',      sub:'ط§ط·ظ„ط¨ ط§ظ„ط¢ظ† ظ…ط¨ط§ط´ط±ط©ظ‹',       href:'https://wa.me/1234567890',       c:'#25D366' },
  { icon:'fab fa-telegram', label:'طھظٹظ„ظٹط¬ط±ط§ظ…',    sub:'طھظˆط§طµظ„ ظ…ط¹ظ†ط§ ط¹ظ„ظ‰ طھظٹظ„ظٹط¬ط±ط§ظ…',  href:'https://t.me/yourchannel',       c:'#0088cc' },
  { icon:'fab fa-discord',  label:'ط¯ظٹط³ظƒظˆط±ط¯',     sub:'ط§ظ†ط¶ظ… ظ„ط³ظٹط±ظپط± ط§ظ„ط¯ط¹ظ…',        href:'https://discord.gg/yourserver',  c:'#5865F2' },
  { icon:'fas fa-headset',  label:'ط§ظ„ط¯ط¹ظ… ط§ظ„ظپظ†ظٹ', sub:'ظ†ط±ط¯ ط®ظ„ط§ظ„ 24 ط³ط§ط¹ط©',         href:'mailto:support@tilago.com',      c:'#9B59D0' },
];

const TICKER_WORDS = ['Team Deathmatch','Kill Feed','Team Logo','Score Board','TDM Pack','Victory Screen','Team Jersey','Esports Kit'];

const FEATURES = [
  { icon:'fas fa-crosshairs',   title:'ظ‡ظˆظٹط© ط§ظ„ظپط±ظٹظ‚',        desc:'طھطµط§ظ…ظٹظ… ط§ط­طھط±ط§ظپظٹط© ظ…ط®طµطµط© ظ„ظپط±ظ‚ TDM طھط¹ظƒط³ ظ‡ظˆظٹط© ظپط±ظٹظ‚ظƒ ط¨ط´ظƒظ„ ظ…ظ…ظٹط².' },
  { icon:'fas fa-bolt',         title:'طھط³ظ„ظٹظ… ط³ط±ظٹط¹',         desc:'طھط³طھظ„ظ… طھطµظ…ظٹظ…ظƒ ظƒط§ظ…ظ„ط§ظ‹ ط®ظ„ط§ظ„ 24 ط³ط§ط¹ط© ظ…ظ† ظˆظ‚طھ ط§ظ„ط·ظ„ط¨.' },
  { icon:'fas fa-sliders-h',    title:'طھط®طµظٹطµ ظƒط§ظ…ظ„',         desc:'ط£ط¶ظپ ط§ط³ظ… ظپط±ظٹظ‚ظƒ ظˆط´ط¹ط§ط±ظƒ ظˆط£ظ„ظˆط§ظ†ظƒ ط¹ظ„ظ‰ ط£ظٹ طھطµظ…ظٹظ… طھط®طھط§ط±ظ‡.' },
  { icon:'fas fa-headset',      title:'ط¯ط¹ظ… ظ…ط³طھظ…ط±',          desc:'ظپط±ظٹظ‚ظ†ط§ ظ…طھط§ط­ ط¯ط§ط¦ظ…ط§ظ‹ ظ„ظ…ط³ط§ط¹ط¯طھظƒ ظپظٹ ط£ظٹ طھط¹ط¯ظٹظ„ ط£ظˆ ط§ط³طھظپط³ط§ط±.' },
];

export default function TdmClient({ packages }: { packages: TdmPkg[] }) {
  const [active, setActive] = useState<TdmPkg | null>(null);

  return (
    <div dir="rtl" className="td">
      <style>{`
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

        .td {
          min-height:100vh;
          background:linear-gradient(180deg,#0F083B,#0C0516);
          color:#d0cce8; font-family:'29LtBukra','Montserrat',sans-serif;
        }

        /* â”€â”€ Hero â”€â”€ */
        .td-hero {
          display:flex; flex-wrap:wrap; align-items:center;
          justify-content:space-around; padding:4rem 5%; gap:2rem;
        }
        .td-hero-video {
          flex:1; min-width:300px; max-width:500px;
          border:1px solid rgba(84,22,181,0.35); border-radius:16px; overflow:hidden;
          box-shadow:0 4px 24px rgba(0,0,0,0.5);
        }
        .td-hero-video video { width:100%; height:auto; display:block; }
        .td-hero-content {
          flex:1; min-width:300px; max-width:500px; padding:1rem;
          display:flex; flex-direction:column; gap:0;
        }
        .td-hero-tag {
          display:inline-flex; align-items:center; gap:7px; margin-bottom:18px;
          font-family:'29LtBukra','Montserrat',sans-serif; font-size:.65rem; font-weight:700;
          letter-spacing:3px; text-transform:uppercase; color:rgba(155,89,208,.75);
          padding:5px 16px; border-radius:20px;
          border:1px solid rgba(155,89,208,.2); background:rgba(84,22,181,.07);
          width:fit-content;
        }
        .td-hero-tag i { font-size:.6rem; }
        .td-hero-content h2 {
          font-family:'29LtBukra','Montserrat',sans-serif; font-size:clamp(1.9rem,3.5vw,2.7rem);
          font-weight:900; color:#eae6ff; line-height:1.25;
          margin-bottom:16px; letter-spacing:-.3px;
        }
        .td-hero-content h2 span {
          background:linear-gradient(135deg,#9B59D0,#5416B5);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .td-hero-content p {
          font-family:'29LtBukra','Montserrat',sans-serif; color:rgba(185,175,215,.5);
          font-size:.95rem; margin-bottom:28px; line-height:1.85;
        }
        .td-hero-divider {
          width:40px; height:2px; border-radius:2px;
          background:linear-gradient(90deg,#5416B5,rgba(84,22,181,0)); margin-bottom:24px;
        }
        .td-hero-cta {
          display:inline-flex; align-items:center; gap:10px;
          padding:.9rem 2.2rem; border-radius:50px;
          background:linear-gradient(135deg,#5416B5,#7F3AA1);
          color:#fff; font-family:'29LtBukra','Montserrat',sans-serif; font-weight:700; font-size:1rem;
          border:none; cursor:pointer; text-decoration:none; width:fit-content;
          box-shadow:0 6px 24px rgba(84,22,181,.4); transition:all .3s ease;
        }
        .td-hero-cta:hover { transform:translateY(-3px); box-shadow:0 10px 32px rgba(84,22,181,.55); }
        .td-hero-cta i { font-size:.85rem; transition:transform .3s; }
        .td-hero-cta:hover i { transform:translateX(-4px); }
        @media(max-width:768px){
          .td-hero { flex-direction:column; text-align:center; }
          .td-hero-tag { margin-inline:auto; }
          .td-hero-divider { margin-inline:auto; }
          .td-hero-cta { margin-inline:auto; }
        }

        /* â”€â”€ Ticker â”€â”€ */
        .td-ticker {
          margin:22px 0 0; height:38px; overflow:hidden; position:relative;
          border-top:1px solid rgba(84,22,181,0.12); border-bottom:1px solid rgba(84,22,181,0.12);
          background:rgba(84,22,181,0.03);
        }
        .td-ticker::before,.td-ticker::after {
          content:''; position:absolute; top:0; bottom:0; width:80px; z-index:2; pointer-events:none;
        }
        .td-ticker::before { left:0; background:linear-gradient(90deg,#0C0516,transparent); }
        .td-ticker::after  { right:0; background:linear-gradient(-90deg,#0C0516,transparent); }
        .td-ticker-track {
          display:flex; align-items:center; height:100%;
          white-space:nowrap; width:max-content; animation:tdTick 32s linear infinite;
        }
        @keyframes tdTick { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .td-ticker-item {
          display:inline-flex; align-items:center; gap:8px; padding:0 26px;
          font-size:.68rem; font-weight:600; letter-spacing:2.5px; text-transform:uppercase;
          color:rgba(170,155,205,0.35);
        }
        .td-ticker-item i { color:rgba(84,22,181,0.5); font-size:.55rem; }
        .td-ticker-dot { color:rgba(84,22,181,0.25); margin:0 4px; }

        /* â”€â”€ Nav â”€â”€ */
        .td-nav { width:100%; padding:20px 5% 28px; }
        .td-nav-row { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; direction:ltr; }
        .td-nav-btn {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:8px; padding:18px 8px 16px; border-radius:16px;
          background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.07);
          color:rgba(175,165,208,0.5); font-family:'Montserrat','29LtBukra'; font-size:.78rem; font-weight:700;
          letter-spacing:.5px; text-transform:uppercase;
          text-decoration:none; position:relative; overflow:hidden;
          transition:all .3s cubic-bezier(.25,.8,.25,1);
        }
        .td-nav-btn::before {
          content:''; position:absolute; inset:0;
          background:radial-gradient(ellipse at 50% 0%,rgba(84,22,181,0.12),transparent 70%);
          opacity:0; transition:opacity .3s;
        }
        .td-nav-btn:hover::before { opacity:1; }
        .td-nav-btn-icon {
          width:40px; height:40px; border-radius:12px;
          display:flex; align-items:center; justify-content:center;
          background:rgba(84,22,181,0.1); border:1px solid rgba(84,22,181,0.18);
          font-size:1.1rem; color:rgba(155,89,208,0.55); transition:all .3s; flex-shrink:0;
        }
        .td-nav-btn:hover {
          background:rgba(84,22,181,0.07); border-color:rgba(155,89,208,0.28);
          color:#e2dcff; transform:translateY(-4px); box-shadow:0 10px 28px rgba(84,22,181,0.18);
        }
        .td-nav-btn:hover .td-nav-btn-icon {
          background:rgba(84,22,181,0.2); border-color:rgba(155,89,208,0.4);
          color:#9B59D0; transform:scale(1.08);
        }

        /* â”€â”€ Stats â”€â”€ */
        .td-stats {
          display:flex; justify-content:center; flex-wrap:wrap; gap:0;
          background:rgba(15,8,59,0.6);
          border-top:1px solid rgba(84,22,181,0.18); border-bottom:1px solid rgba(84,22,181,0.18);
        }
        .td-stat-item {
          flex:1; min-width:160px; padding:1.8rem 1rem;
          text-align:center; border-left:1px solid rgba(84,22,181,0.15);
        }
        .td-stat-item:last-child { border-left:none; }
        .td-stat-num {
          font-family:'Oxanium',sans-serif; font-size:1.8rem; font-weight:800;
          color:#9B59D0; display:block; margin-bottom:.3rem;
        }
        .td-stat-label { color:rgba(170,155,200,0.65); font-size:.8rem; letter-spacing:1px; }
        @media(max-width:768px){
          .td-stat-item { min-width:50%; border-left:none; border-bottom:1px solid rgba(84,22,181,0.1); padding:1.2rem .5rem; }
          .td-stat-num { font-size:1.5rem; }
        }

        /* â”€â”€ Section Head â”€â”€ */
        .td-head { text-align:center; padding:40px 16px 36px; }
        .td-head-tag {
          display:inline-block; font-size:.62rem; font-weight:700; letter-spacing:4px;
          text-transform:uppercase; color:rgba(155,89,208,0.7);
          padding:5px 20px; border-radius:20px;
          border:1px solid rgba(155,89,208,0.18); background:rgba(84,22,181,0.06); margin-bottom:18px;
        }
        .td-head h2 {
          font-family:'29LtBukra','Montserrat'; font-size:clamp(1.6rem,3.5vw,2.4rem);
          color:#eae6ff; font-weight:900; letter-spacing:.5px; margin-bottom:10px; line-height:1.3;
        }
        .td-head h2 span { color:#9B59D0; }
        .td-head p { font-size:.9rem; color:rgba(170,160,205,0.38); max-width:400px; margin:0 auto; line-height:1.7; }

        /* â”€â”€ Grid â”€â”€ */
        .td-products {
          padding:0 5% 4rem;
          display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1.5rem;
        }

        /* â”€â”€ Card â”€â”€ */
        .td-card {
          position:relative; border-radius:14px; overflow:hidden;
          background:rgba(15,8,59,0.5); border:1px solid rgba(84,22,181,0.2);
          box-shadow:0 4px 16px rgba(0,0,0,0.3); cursor:pointer; transition:all .3s ease; height:260px;
        }
        .td-card:hover { transform:translateY(-6px); box-shadow:0 8px 24px rgba(84,22,181,0.25); border-color:rgba(84,22,181,0.5); }
        .td-card img { width:100%; height:100%; object-fit:cover; display:block; image-rendering:-webkit-optimize-contrast; transition:transform .55s cubic-bezier(.25,.8,.25,1); }
        .td-card:hover img { transform:scale(1.06); }
        .td-card-grad {
          position:absolute; inset:0;
          background:linear-gradient(to top,rgba(4,1,14,0.96) 0%,rgba(4,1,14,0.5) 35%,rgba(4,1,14,0.05) 65%,transparent 100%);
          transition:background .3s;
        }
        .td-card:hover .td-card-grad {
          background:linear-gradient(to top,rgba(4,1,14,0.98) 0%,rgba(14,5,40,0.7) 45%,rgba(84,22,181,0.08) 70%,transparent 100%);
        }
        .td-card-body { position:absolute; bottom:0; left:0; right:0; padding:18px 18px 16px; z-index:2; }
        .td-card-name { font-family:'29LtBukra','Montserrat'; font-size:1.05rem; font-weight:700; color:#e8e4f8; margin-bottom:3px; }
        .td-card-sub  { color:rgba(170,155,200,0.5); font-size:.78rem; font-weight:500; }
        .td-card-badge {
          position:absolute; top:12px; right:12px; z-index:2;
          display:flex; align-items:center; gap:5px;
          padding:4px 10px; border-radius:20px;
          background:rgba(8,2,18,0.75); backdrop-filter:blur(10px);
          border:1px solid rgba(84,22,181,0.28);
          font-size:.6rem; font-weight:700; letter-spacing:1px;
          color:rgba(180,165,215,0.6); text-transform:uppercase;
        }
        .td-card-badge i { font-size:.52rem; color:#7F3AA1; }

        /* Empty */
        .td-empty { text-align:center; padding:80px 20px; color:rgba(170,155,205,0.4); grid-column:1/-1; }
        .td-empty i { font-size:3rem; margin-bottom:16px; display:block; opacity:.3; }
        .td-empty p { font-size:.9rem; }

        /* â”€â”€ Features â”€â”€ */
        .td-features {
          padding:3rem 5%; display:grid;
          grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1.2rem;
          background:linear-gradient(180deg,#0C0516,#0F083B);
          border-top:1px solid rgba(84,22,181,0.15); border-bottom:1px solid rgba(84,22,181,0.15);
        }
        .td-feature-card {
          background:rgba(15,8,59,0.5); border-radius:14px; padding:1.8rem 1.4rem;
          border:1px solid rgba(84,22,181,0.15); text-align:right;
          transition:border-color .3s, transform .3s;
        }
        .td-feature-card:hover { border-color:rgba(127,58,161,0.5); transform:translateY(-4px); }
        .td-feature-icon {
          width:44px; height:44px; border-radius:12px; margin-bottom:1rem;
          background:rgba(84,22,181,0.2); border:1px solid rgba(127,58,161,0.3);
          display:flex; align-items:center; justify-content:center; color:#9B59D0; font-size:1.1rem;
        }
        .td-feature-title { font-weight:700; color:#e8e4f8; margin-bottom:.5rem; font-size:1rem; }
        .td-feature-desc  { color:rgba(160,150,190,0.65); font-size:.82rem; line-height:1.6; }

        /* â”€â”€ Contact Buttons â”€â”€ */
        .td-contact-btns { display:grid; grid-template-columns:repeat(2,1fr); gap:.6rem; padding:2rem 5%; }
        .td-contact-btn {
          display:flex; align-items:center; gap:10px;
          padding:.9rem 1.2rem; border-radius:14px;
          font-weight:600; font-size:.88rem; color:#d0cce8;
          text-decoration:none; transition:all .3s ease;
          background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); backdrop-filter:blur(6px);
        }
        .td-contact-btn-icon { width:36px; height:36px; border-radius:10px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:1.1rem; }
        .td-contact-btn-text { display:flex; flex-direction:column; gap:1px; }
        .td-contact-btn-title { font-size:.82rem; font-weight:700; color:#e8e4f8; }
        .td-contact-btn-sub   { font-size:.68rem; color:rgba(180,170,210,0.5); font-weight:400; }
        .td-contact-btn:hover { background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.14); transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.2); }

        /* â”€â”€ Backdrop â”€â”€ */
        .td-backdrop { position:fixed; inset:0; z-index:300; background:rgba(0,0,0,0.6); backdrop-filter:blur(3px); animation:tdFade .25s ease; }
        @keyframes tdFade { from{opacity:0} to{opacity:1} }

        /* â”€â”€ Drawer â”€â”€ */
        .td-detail {
          position:fixed; top:0; right:0; bottom:0;
          width:62%; max-width:760px; z-index:301;
          background:#0a0514; overflow-y:auto; overflow-x:hidden;
          padding-bottom:100px; animation:tdSlide .32s cubic-bezier(.25,.8,.25,1);
          box-shadow:-16px 0 60px rgba(0,0,0,0.75);
        }
        @keyframes tdSlide { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @media(max-width:768px){ .td-detail{width:90%} }
        @media(max-width:480px){ .td-detail{width:100%} }

        .td-detail-bar {
          display:flex; align-items:center; gap:12px; padding:14px 20px;
          background:rgba(8,2,18,0.92); backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(84,22,181,0.14);
          position:sticky; top:0; z-index:10;
        }
        .td-back {
          width:34px; height:34px; border-radius:50%; flex-shrink:0;
          display:inline-flex; align-items:center; justify-content:center;
          background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12);
          color:rgba(210,200,235,0.8); font-size:.8rem; cursor:pointer; transition:all .2s;
        }
        .td-back:hover { background:rgba(255,255,255,0.14); color:#fff; transform:scale(1.1); }
        .td-detail-name { font-family:'Oxanium'; font-size:clamp(.78rem,2vw,1rem); color:#e4e0f5; font-weight:800; flex:1; }
        .td-detail-cnt  { font-size:.66rem; font-weight:700; letter-spacing:1.5px; color:rgba(155,89,208,0.65); white-space:nowrap; }

        .td-detail-hero { position:relative; height:240px; overflow:hidden; background:#0a0514; }
        .td-detail-hero-img { width:100%; height:100%; object-fit:cover; filter:brightness(0.3) blur(3px); transform:scale(1.06); }
        .td-detail-hero-overlay { position:absolute; inset:0; background:linear-gradient(to top,#0a0514 0%,rgba(10,5,20,0.25) 55%,transparent 100%); }
        .td-detail-hero-content { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:20px; }
        .td-detail-hero-tag {
          font-size:.62rem; font-weight:700; letter-spacing:3px; text-transform:uppercase;
          color:rgba(155,89,208,0.75); padding:4px 14px; border-radius:20px;
          border:1px solid rgba(155,89,208,0.3); background:rgba(84,22,181,0.12);
        }
        .td-detail-hero-title { font-family:'Oxanium'; font-size:clamp(1.1rem,3vw,1.9rem); font-weight:900; color:#fff; text-align:center; text-shadow:0 0 40px rgba(155,89,208,0.5); letter-spacing:1px; }
        .td-detail-hero-sub { font-size:clamp(.72rem,1.6vw,.88rem); color:rgba(200,190,225,0.55); font-weight:600; }
        @media(max-width:480px){ .td-detail-hero{height:180px} }

        .td-pkg-video { width:100%; background:#000; line-height:0; }
        .td-pkg-video video { width:100%; display:block; max-height:70vh; object-fit:contain; }
        .td-pkg-video-label {
          padding:10px 20px; background:rgba(84,22,181,0.08); border-bottom:1px solid rgba(84,22,181,0.12);
          font-size:.75rem; font-weight:700; letter-spacing:2px; text-transform:uppercase;
          color:rgba(155,89,208,0.6); display:flex; align-items:center; gap:8px;
        }

        .td-imgs { display:flex; flex-direction:column; gap:0; }
        .td-img-wrap { width:100%; overflow:hidden; background:#0a0514; line-height:0; }
        .td-img-wrap img { width:100%; height:auto; display:block; image-rendering:-webkit-optimize-contrast; }
        .td-img-sep { height:2px; background:linear-gradient(90deg,transparent,rgba(84,22,181,0.3),transparent); }

        /* â”€â”€ Contacts Panel â”€â”€ */
        .td-contacts-panel {
          position:fixed; top:0; left:0; bottom:0; width:38%; z-index:302;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:40px 32px; animation:tdFade .35s ease; pointer-events:none;
        }
        .td-close-btn {
          position:absolute; top:20px; left:50%; transform:translateX(-50%);
          width:36px; height:36px; border-radius:50%;
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
          color:rgba(200,185,230,0.5); display:flex; align-items:center; justify-content:center;
          font-size:.8rem; cursor:pointer; pointer-events:all; transition:all .2s;
        }
        .td-close-btn:hover { background:rgba(255,255,255,0.1); color:rgba(220,210,245,0.9); }
        .td-contacts-inner { width:100%; max-width:320px; pointer-events:all; }
        .td-order-label {
          font-size:.62rem; font-weight:700; letter-spacing:4px; text-transform:uppercase;
          color:rgba(155,89,208,0.4); margin-bottom:24px; text-align:center;
          display:flex; align-items:center; justify-content:center; gap:10px;
        }
        .td-order-label::before,.td-order-label::after { content:''; width:28px; height:1px; background:rgba(155,89,208,0.3); display:block; }
        .td-contacts-list { display:flex; flex-direction:column; gap:12px; }
        .td-contact {
          display:flex; align-items:center; gap:16px; padding:17px 20px; border-radius:16px;
          background:rgba(10,4,22,0.72); border:1px solid rgba(84,22,181,0.2); color:#d0cce8; text-decoration:none;
          transition:all .25s cubic-bezier(.25,.8,.25,1); backdrop-filter:blur(16px); box-shadow:0 4px 20px rgba(0,0,0,0.3);
        }
        .td-contact:hover { background:rgba(22,8,50,0.88); border-color:rgba(155,89,208,0.45); transform:translateY(-3px) scale(1.02); box-shadow:0 12px 36px rgba(84,22,181,0.28); }
        .td-contact-icon { width:50px; height:50px; border-radius:14px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:1.45rem; }
        .td-contact-text { flex:1; }
        .td-contact-label { font-size:.98rem; font-weight:800; color:#ece8ff; margin-bottom:3px; }
        .td-contact-sub   { font-size:.7rem; color:rgba(170,160,205,0.35); line-height:1.4; }
        .td-contact-arrow { color:rgba(155,89,208,0.22); font-size:.78rem; transition:all .25s; }
        .td-contact:hover .td-contact-arrow { color:rgba(155,89,208,0.7); transform:translateX(-4px); }
        @media(max-width:768px){ .td-contacts-panel{display:none} }

        /* â”€â”€ Responsive â”€â”€ */
        @media(max-width:1024px){ .td-products { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:768px){
          .td-nav-row { gap:8px; }
          .td-nav-btn { padding:22px 8px 18px; gap:10px; border-radius:16px; font-size:.85rem; }
          .td-nav-btn-icon { width:44px; height:44px; font-size:1.2rem; border-radius:13px; }
          .td-products { grid-template-columns:repeat(2,1fr); padding:0 4% 3rem; gap:1rem; }
          .td-contact-btns { grid-template-columns:1fr; padding:1.5rem 5%; }
          .td-features { padding:2.5rem 4%; gap:1rem; }
        }
        @media(max-width:480px){
          .td-products { grid-template-columns:1fr; }
          .td-nav-row { grid-template-columns:repeat(2,1fr); }
          .td-card { height:220px; }
        }
        @media(hover:none){ .td-card:hover{transform:none} .td-contact:hover{transform:none} }
      `}</style>

      {/* Hero */}
      <section className="td-hero">
        <div className="td-hero-video">
          <video autoPlay muted loop playsInline>
            <source src="https://res.cloudinary.com/v6vo90hw/video/upload/v1784782950/tilago/tilago.mp4" type="video/mp4"/>
          </video>
        </div>
        <div className="td-hero-content">
          <div className="td-hero-tag"><i className="fas fa-crosshairs"/> TDM ESPORTS</div>
          <h2>طھطµط§ظ…ظٹظ… <span>TDM</span> ظ…ظ† Tilago</h2>
          <div className="td-hero-divider"/>
          <p>طھطµط§ظ…ظٹظ… ط§ط­طھط±ط§ظپظٹط© ظ„ظپط±ظ‚ TDM â€” ظ‡ظˆظٹط§طھ ط¨طµط±ظٹط©طŒ ظƒظٹظ„-ظپظٹط¯طŒ ط£ظˆظپط±ظ„ط§ظٹطŒ ظˆط´ط§ط´ط§طھ ط§ظ„ظپظˆط². ظƒظ„ ط´ظٹط، ظ…ط®طµطµ ظ„ظپط±ظٹظ‚ظƒ.</p>
          <a href="#packages" className="td-hero-cta">طھطµظپط­ ط§ظ„ط¨ط§ظƒط¯ط¬ط§طھ <i className="fas fa-arrow-left"/></a>
        </div>
      </section>

      {/* Ticker */}
      <div className="td-ticker">
        <div className="td-ticker-track">
          {[...TICKER_WORDS,...TICKER_WORDS].map((w,i)=>(
            <span key={i} className="td-ticker-item">
              <i className="fas fa-crosshairs"/>{w}
              <span className="td-ticker-dot">âœ¦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="td-nav">
        <div className="td-nav-row">
          <Link href="/3d"           className="td-nav-btn"><div className="td-nav-btn-icon"><i className="fas fa-cube"/></div>3D</Link>
          <Link href="/alerts"       className="td-nav-btn"><div className="td-nav-btn-icon"><i className="fas fa-bell"/></div>Alerts</Link>
          <Link href="/stream"       className="td-nav-btn"><div className="td-nav-btn-icon"><i className="fas fa-video"/></div>Stream</Link>
          <Link href="/esports/pubg" className="td-nav-btn"><div className="td-nav-btn-icon"><i className="fas fa-trophy"/></div>PUBG</Link>
        </div>
      </nav>

      {/* Stats */}
      {!active && (
        <div className="td-stats">
          {[
            { num: packages.length > 0 ? `+${packages.length}` : '0', label:'ط¨ط§ظƒط¯ط¬ ط¬ط§ظ‡ط²' },
            { num:'30+',  label:'ظپط±ظٹظ‚ ظ…طµظ…ظ…' },
            { num:'24h',  label:'ظˆظ‚طھ ط§ظ„طھط³ظ„ظٹظ…' },
            { num:'100%', label:'ظ…ط®طµطµ ظ„ظپط±ظٹظ‚ظƒ' },
          ].map(s=>(
            <div key={s.label} className="td-stat-item">
              <span className="td-stat-num">{s.num}</span>
              <span className="td-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {!active && (
        <>
          <div className="td-head" id="packages">
            <span className="td-head-tag">TDM ESPORTS</span>
            <h2>ط¨ط§ظƒط¯ط¬ط§طھ <span>TDM</span></h2>
            <p>ط§ط¶ط؛ط· ط¹ظ„ظ‰ ط£ظٹ ط¨ط§ظƒط¯ط¬ ظ„ظ…ط´ط§ظ‡ط¯ط© طھظپط§طµظٹظ„ظ‡ ظˆظƒظ„ ظ…ط§ ظٹط­طھظˆظٹظ‡</p>
          </div>

          <div className="td-products">
            {packages.length === 0 ? (
              <div className="td-empty">
                <i className="fas fa-crosshairs"/>
                <p>ظ„ط§ طھظˆط¬ط¯ ط¨ط§ظƒط¯ط¬ط§طھ ظ…طھط§ط­ط© ط­ط§ظ„ظٹط§ظ‹</p>
              </div>
            ) : packages.map(pkg=>(
              <div key={pkg.id} className="td-card" onClick={()=>setActive(pkg)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {pkg.cover && <img src={pkg.cover} alt={pkg.nameAr}/>}
                <div className="td-card-grad"/>
                <div className="td-card-badge">
                  <i className="fas fa-crosshairs"/>
                  {pkg.images.length} ط¹ظ†طµط±
                </div>
                <div className="td-card-body">
                  <div className="td-card-name">{pkg.nameAr}</div>
                  {pkg.name && pkg.name !== pkg.nameAr && <div className="td-card-sub">{pkg.name}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Features */}
          <section className="td-features">
            {FEATURES.map(f=>(
              <div key={f.title} className="td-feature-card">
                <div className="td-feature-icon"><i className={f.icon}/></div>
                <div className="td-feature-title">{f.title}</div>
                <div className="td-feature-desc">{f.desc}</div>
              </div>
            ))}
          </section>

          {/* Contact */}
          <div className="td-contact-btns" style={{maxWidth:'580px',margin:'0 auto'}}>
            {CONTACTS.map(btn=>(
              <a key={btn.label} href={btn.href} target="_blank" rel="noreferrer" className="td-contact-btn">
                <div className="td-contact-btn-icon" style={{background:`${btn.c}18`,color:btn.c}}>
                  <i className={btn.icon}/>
                </div>
                <div className="td-contact-btn-text">
                  <span className="td-contact-btn-title">{btn.label}</span>
                  <span className="td-contact-btn-sub">طھظˆط§طµظ„ ظ…ط¹ظ†ط§</span>
                </div>
              </a>
            ))}
          </div>
        </>
      )}

      {/* Detail Drawer */}
      {active && (
        <>
          <div className="td-backdrop" onClick={()=>setActive(null)}/>

          <div className="td-contacts-panel">
            <button className="td-close-btn" onClick={()=>setActive(null)}>
              <i className="fas fa-times"/>
            </button>
            <div className="td-contacts-inner">
              <div className="td-order-label">طھظˆط§طµظ„ ظ„ظ„ط·ظ„ط¨</div>
              <div className="td-contacts-list">
                {CONTACTS.map(b=>(
                  <a key={b.label} href={b.href} target="_blank" rel="noreferrer" className="td-contact">
                    <div className="td-contact-icon" style={{background:`${b.c}15`,color:b.c}}>
                      <i className={b.icon}/>
                    </div>
                    <div className="td-contact-text">
                      <div className="td-contact-label">{b.label}</div>
                      <div className="td-contact-sub">{b.sub}</div>
                    </div>
                    <i className="fas fa-chevron-left td-contact-arrow"/>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="td-detail">
            <div className="td-detail-bar">
              <div className="td-detail-name">{active.nameAr}</div>
              <div className="td-detail-cnt">{active.images.length} ط¹ظ†طµط±</div>
              <button className="td-back" onClick={()=>setActive(null)}>
                <i className="fas fa-times"/>
              </button>
            </div>

            <div className="td-detail-hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {active.cover && <img className="td-detail-hero-img" src={active.cover} alt={active.nameAr}/>}
              <div className="td-detail-hero-overlay"/>
              <div className="td-detail-hero-content">
                <div className="td-detail-hero-tag">TDM ESPORTS</div>
                <div className="td-detail-hero-title">{active.nameAr}</div>
                {active.name && active.name !== active.nameAr && (
                  <div className="td-detail-hero-sub">{active.name}</div>
                )}
              </div>
            </div>

            {active.video && (
              <div className="td-pkg-video">
                <div className="td-pkg-video-label"><i className="fas fa-play-circle"/> ظ…ط¹ط§ظٹظ†ط© ط§ظ„ط¨ط§ظƒط¯ط¬</div>
                <video controls muted loop playsInline preload="metadata" src={active.video}/>
              </div>
            )}

            <div className="td-imgs">
              {active.images.map((src,i)=>(
                <div key={i}>
                  {i > 0 && <div className="td-img-sep"/>}
                  <div className="td-img-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`${active.nameAr} ${i+1}`}/>
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

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function HomeV2() {
  const [mounted, setMounted] = useState(false);

  /* ── Scroll reveal ── */
  useEffect(() => {
    setMounted(true);

    const reveal = () => {
      const els = document.querySelectorAll<HTMLElement>('.rv:not(.rv-in), .rv-scale:not(.rv-in), .rv-left:not(.rv-in), .rv-right:not(.rv-in)');
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92) {
          const delay = Number(el.dataset.delay ?? 0);
          setTimeout(() => el.classList.add('rv-in'), delay);
        }
      });
    };

    // Run on scroll + initial check after mount
    window.addEventListener('scroll', reveal, { passive: true });
    const t = setTimeout(reveal, 100);
    return () => {
      window.removeEventListener('scroll', reveal);
      clearTimeout(t);
    };
  }, []);

  return (
    <div dir="rtl" className="hv2">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800;900&family=Cairo:wght@400;600;700;800&display=swap');

        .hv2{
          min-height:100vh;
          font-family:'Cairo',sans-serif;
          color:#c8c3de;
        }

        /* ── Reveal system ── */
        .rv{
          opacity:0;
          transform:translateY(48px);
          transition:opacity .7s cubic-bezier(.25,.8,.25,1),
                      transform .7s cubic-bezier(.25,.8,.25,1);
          will-change:opacity,transform;
        }
        .rv.rv-in{
          opacity:1;
          transform:translateY(0);
        }
        .rv-left{
          opacity:0;
          transform:translateX(-48px);
          transition:opacity .7s cubic-bezier(.25,.8,.25,1),
                      transform .7s cubic-bezier(.25,.8,.25,1);
        }
        .rv-left.rv-in{ opacity:1; transform:translateX(0); }

        .rv-right{
          opacity:0;
          transform:translateX(48px);
          transition:opacity .7s cubic-bezier(.25,.8,.25,1),
                      transform .7s cubic-bezier(.25,.8,.25,1);
        }
        .rv-right.rv-in{ opacity:1; transform:translateX(0); }

        .rv-scale{
          opacity:0;
          transform:scale(.88);
          transition:opacity .65s cubic-bezier(.25,.8,.25,1),
                      transform .65s cubic-bezier(.25,.8,.25,1);
        }
        .rv-scale.rv-in{ opacity:1; transform:scale(1); }

        /* ── Hero ── */
        .v2-hero{
          padding:20px 16px 0;
          position:relative;overflow:hidden;
        }
        .v2-hero-box{
          max-width:1700px;margin:0 auto;
          border-radius:52px;overflow:hidden;
          border:4px solid rgba(127,58,161,0.3);
          height:630px;
          box-shadow:0 0 60px rgba(84,22,181,0.12);
          position:relative;
        }
        .v2-hero-box img{
          width:100%;height:100%;
          object-fit:cover;object-position:center top;
          display:block;
          transition:transform 8s ease;
        }
        .v2-hero-box:hover img{ transform:scale(1.04); }
        .v2-hero-glow{
          position:absolute;inset:0;
          background:radial-gradient(ellipse at 50% 80%,rgba(84,22,181,0.18),transparent 70%);
          pointer-events:none;
        }
        @media(max-width:900px){.v2-hero-box{height:400px;border-radius:28px}}
        @media(max-width:560px){.v2-hero-box{height:220px;border-radius:16px}}

        /* ── Ticker ── */
        .v2-ticker{
          margin:18px 0;height:40px;overflow:hidden;position:relative;
          border-top:1px solid rgba(84,22,181,0.18);
          border-bottom:1px solid rgba(84,22,181,0.18);
          background:rgba(84,22,181,0.04);
        }
        .v2-ticker::before,.v2-ticker::after{
          content:'';position:absolute;top:0;bottom:0;width:120px;z-index:2;pointer-events:none;
        }
        .v2-ticker::before{left:0;background:linear-gradient(90deg,#0C0516,transparent)}
        .v2-ticker::after{right:0;background:linear-gradient(-90deg,#0C0516,transparent)}
        .v2-ticker-track{
          display:flex;align-items:center;height:100%;
          white-space:nowrap;width:max-content;
          animation:v2Tick 28s linear infinite;
        }
        @keyframes v2Tick{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .v2-ticker-item{
          display:inline-flex;align-items:center;gap:8px;padding:0 28px;
          font-size:.72rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;
          color:rgba(180,165,215,0.45);
        }
        .v2-ticker-item i{color:#5416B5;font-size:.6rem}
        .v2-ticker-sep{color:rgba(84,22,181,0.35);padding:0 4px}

        /* ── Quick Nav ── */
        .v2-nav{max-width:1200px;margin:0 auto;padding:0 16px 32px}
        .v2-nav-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
        .v2-nav-btn{
          display:flex;align-items:center;justify-content:center;gap:9px;
          padding:14px 10px;border-radius:14px;
          background:rgba(15,8,59,0.5);
          border:1px solid rgba(84,22,181,0.2);
          color:rgba(190,182,218,0.65);
          font-family:'Orbitron';font-size:.82rem;font-weight:700;
          letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;
          transition:all .3s;
        }
        .v2-nav-btn i{color:#5416B5;font-size:.9rem;transition:color .3s}
        .v2-nav-btn:hover{
          background:rgba(84,22,181,0.18);border-color:rgba(127,58,161,0.55);
          color:#fff;transform:translateY(-4px);
          box-shadow:0 8px 24px rgba(84,22,181,0.22);
        }
        .v2-nav-btn:hover i{color:#9B59D0}
        @media(max-width:560px){.v2-nav-grid{grid-template-columns:repeat(2,1fr)}}

        /* ── Section Label ── */
        .v2-tag{
          display:inline-block;font-size:.65rem;font-weight:700;letter-spacing:3px;
          text-transform:uppercase;color:#7F3AA1;
          padding:4px 16px;border-radius:20px;
          border:1px solid rgba(127,58,161,0.3);background:rgba(84,22,181,0.07);
          margin-bottom:12px;
        }

        /* ── Services ── */
        .v2-srv{padding:60px 20px}
        .v2-srv-head{text-align:center;margin-bottom:48px}
        .v2-srv-head h2{
          font-family:'Orbitron';font-size:clamp(1.2rem,3vw,2rem);
          color:#e4e0f5;font-weight:800;margin-bottom:8px;
        }
        .v2-srv-head p{font-size:.9rem;color:rgba(170,160,205,0.5)}
        .v2-srv-grid{
          display:grid;grid-template-columns:repeat(3,1fr);
          gap:16px;max-width:1100px;margin:0 auto;
        }
        .v2-srv-card{
          display:flex;align-items:center;gap:16px;
          padding:22px 20px;border-radius:16px;
          background:rgba(15,8,40,0.6);
          border:1px solid rgba(84,22,181,0.15);
          text-decoration:none;color:#c8c3de;
          transition:all .3s;
        }
        .v2-srv-card:hover{
          background:rgba(84,22,181,0.12);
          border-color:rgba(155,89,208,0.4);
          transform:translateY(-5px);
          box-shadow:0 12px 32px rgba(84,22,181,0.2);
        }
        .v2-srv-icon{
          width:50px;height:50px;border-radius:14px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          font-size:1.3rem;
          background:rgba(84,22,181,0.15);color:#9B59D0;
          transition:all .3s;
        }
        .v2-srv-card:hover .v2-srv-icon{
          background:rgba(84,22,181,0.28);color:#c8a8f0;
          transform:scale(1.1);
        }
        .v2-srv-card h3{font-size:.95rem;font-weight:800;color:#ddd9f5;margin-bottom:4px}
        .v2-srv-card p{font-size:.78rem;color:rgba(170,160,205,0.5)}
        @media(max-width:900px){.v2-srv-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:560px){.v2-srv-grid{grid-template-columns:1fr}}

        /* ── Why Us ── */
        .v2-why{padding:60px 20px;background:rgba(84,22,181,0.03)}
        .v2-why-head{text-align:center;margin-bottom:48px}
        .v2-why-head h2{
          font-family:'Orbitron';font-size:clamp(1.1rem,2.5vw,1.8rem);
          color:#e4e0f5;font-weight:800;margin-bottom:8px;
        }
        .v2-why-grid{
          display:grid;grid-template-columns:repeat(4,1fr);
          gap:16px;max-width:1100px;margin:0 auto;
        }
        .v2-why-card{
          padding:28px 20px;border-radius:18px;text-align:center;
          background:rgba(12,5,22,0.7);
          border:1px solid rgba(84,22,181,0.12);
          transition:all .35s;
        }
        .v2-why-card:hover{
          border-color:rgba(155,89,208,0.35);
          transform:translateY(-6px);
          box-shadow:0 16px 40px rgba(84,22,181,0.18);
        }
        .v2-why-icon{
          width:56px;height:56px;border-radius:16px;margin:0 auto 16px;
          display:flex;align-items:center;justify-content:center;
          font-size:1.4rem;
          background:rgba(84,22,181,0.12);color:#9B59D0;
          transition:all .35s;
        }
        .v2-why-card:hover .v2-why-icon{
          background:rgba(84,22,181,0.25);color:#c8a8f0;transform:scale(1.08) rotate(-5deg);
        }
        .v2-why-card h3{font-size:.95rem;font-weight:800;color:#ddd9f5;margin-bottom:8px}
        .v2-why-card p{font-size:.8rem;color:rgba(170,160,205,0.45);line-height:1.6}
        @media(max-width:900px){.v2-why-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:480px){.v2-why-grid{grid-template-columns:1fr}}

        /* ── Stats ── */
        .v2-stats{padding:60px 20px}
        .v2-stats-grid{
          display:flex;align-items:center;justify-content:center;
          gap:0;max-width:900px;margin:0 auto;
          background:rgba(84,22,181,0.06);
          border:1px solid rgba(84,22,181,0.15);
          border-radius:24px;overflow:hidden;
        }
        .v2-stat{
          flex:1;padding:36px 20px;text-align:center;
          border-left:1px solid rgba(84,22,181,0.12);
          transition:background .3s;
        }
        .v2-stat:last-child{border-left:none}
        .v2-stat:hover{background:rgba(84,22,181,0.08)}
        .v2-stat-num{
          font-family:'Orbitron';font-size:clamp(1.6rem,3.5vw,2.4rem);
          font-weight:900;color:#9B59D0;display:block;margin-bottom:6px;
        }
        .v2-stat-lbl{font-size:.8rem;color:rgba(170,160,205,0.5);font-weight:700}
        @media(max-width:600px){
          .v2-stats-grid{flex-direction:column}
          .v2-stat{border-left:none;border-top:1px solid rgba(84,22,181,0.12)}
          .v2-stat:first-child{border-top:none}
        }

        /* ── Contact CTA ── */
        .v2-cta{
          padding:80px 20px;text-align:center;
          background:linear-gradient(180deg,transparent,rgba(84,22,181,0.06),transparent);
        }
        .v2-cta h2{
          font-family:'Orbitron';font-size:clamp(1.3rem,3vw,2rem);
          color:#e4e0f5;font-weight:900;margin-bottom:16px;
        }
        .v2-cta p{font-size:.95rem;color:rgba(170,160,205,0.5);margin-bottom:32px}
        .v2-cta-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
        .v2-cta-btn{
          display:inline-flex;align-items:center;gap:10px;
          padding:14px 32px;border-radius:50px;font-family:'Cairo';
          font-size:1rem;font-weight:800;text-decoration:none;
          transition:all .3s;
        }
        .v2-cta-btn.primary{
          background:linear-gradient(135deg,#5416B5,#7F3AA1);
          color:#fff;
          box-shadow:0 8px 28px rgba(84,22,181,0.35);
        }
        .v2-cta-btn.primary:hover{
          transform:translateY(-3px);
          box-shadow:0 14px 36px rgba(84,22,181,0.5);
        }
        .v2-cta-btn.secondary{
          background:rgba(84,22,181,0.1);
          border:1px solid rgba(84,22,181,0.3);
          color:rgba(200,190,225,0.8);
        }
        .v2-cta-btn.secondary:hover{
          background:rgba(84,22,181,0.2);
          border-color:rgba(155,89,208,0.5);
          color:#fff;transform:translateY(-3px);
        }

        /* ── Platforms strip ── */
        .v2-plat{padding:20px 0 36px;overflow:hidden}
        .v2-plat-label{text-align:center;font-size:.72rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(150,140,185,0.35);margin-bottom:18px}
        .v2-plat-wrap{overflow:hidden;position:relative;mask-image:linear-gradient(90deg,transparent,black 15%,black 85%,transparent)}
        .v2-plat-track{display:flex;gap:0;width:max-content;animation:platFwd 28s linear infinite}
        .v2-plat-track.bwd{animation:platBwd 28s linear infinite}
        @keyframes platFwd{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes platBwd{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}
        .v2-plat-item{
          display:inline-flex;align-items:center;gap:8px;padding:8px 22px;
          font-size:.78rem;font-weight:700;color:rgba(180,165,215,0.4);white-space:nowrap;
        }
        .v2-plat-item i{font-size:.85rem;color:#5416B5}

        /* Version badge */
        .v2-badge{
          position:fixed;bottom:80px;right:16px;z-index:9999;
          padding:6px 14px;border-radius:20px;font-size:.65rem;font-weight:800;letter-spacing:1px;
          background:rgba(84,22,181,0.9);color:#fff;border:1px solid rgba(155,89,208,0.5);
          pointer-events:none;
        }
      `}</style>

      {/* Version badge */}
      <div className="v2-badge">BETA V2</div>

      {/* Hero */}
      <section className="v2-hero rv-scale">
        <div className="v2-hero-box">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/55.png" alt="Tilago Store"/>
          <div className="v2-hero-glow"/>
        </div>
      </section>

      {/* Ticker */}
      <div className="v2-ticker">
        <div className="v2-ticker-track">
          {['Stream Pack','Logo','Overlay','Alert','Starting Screen','Ending Screen','3D Design','Discord','Stream Pack','Logo','Overlay','Alert','Starting Screen','Ending Screen','3D Design','Discord'].map((w,i)=>(
            <span key={i} className="v2-ticker-item">
              <i className="fas fa-layer-group"/>{w}
              <span className="v2-ticker-sep">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Quick Nav */}
      <nav className="v2-nav rv" data-delay="0">
        <div className="v2-nav-grid">
          <Link href="/3d"     className="v2-nav-btn"><i className="fas fa-cube"/>     3D</Link>
          <Link href="/video"  className="v2-nav-btn"><i className="fas fa-film"/>     Video</Link>
          <Link href="/stream" className="v2-nav-btn"><i className="fas fa-video"/>    Stream</Link>
          <Link href="/alerts" className="v2-nav-btn"><i className="fas fa-bell"/>     Alert</Link>
        </div>
      </nav>

      {/* Platforms */}
      <div className="v2-plat rv" data-delay="0">
        <p className="v2-plat-label">متوافق مع جميع منصات البث</p>
        {[
          ['fab fa-twitch','Twitch','fab fa-youtube','YouTube','fab fa-tiktok','TikTok','fab fa-discord','Discord','fas fa-video','OBS Studio','fab fa-instagram','Instagram','fas fa-tv','Kick'],
          ['fas fa-gamepad','StreamElements','fas fa-film','Streamlabs','fab fa-facebook','Facebook Live','fas fa-trophy','Esports','fas fa-headset','XSplit','fas fa-stream','Trovo','fas fa-broadcast-tower','Caffeine'],
        ].map((row,ri)=>{
          const items=[];
          for(let i=0;i<row.length;i+=2) items.push({icon:row[i],name:row[i+1]});
          const doubled=[...items,...items,...items];
          return(
            <div key={ri} className="v2-plat-wrap" style={{marginTop:ri?'10px':undefined}}>
              <div className={`v2-plat-track${ri?' bwd':''}`}>
                {doubled.map((p,i)=>(
                  <span key={i} className="v2-plat-item">
                    <i className={p.icon}/>{p.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Services */}
      <section className="v2-srv">
        <div className="v2-srv-head rv" data-delay="0">
          <span className="v2-tag">خدماتنا</span>
          <h2>اكتشف ما نقدمه</h2>
          <p>كل ما تحتاجه لقناتك في مكان واحد</p>
        </div>
        <div className="v2-srv-grid">
          {[
            {icon:'fas fa-bell',       title:'Stream Alerts',   desc:'يرتات احترافية للتنبيهات',    href:'/alerts'},
            {icon:'fas fa-layer-group',title:'Overlay',         desc:'أوفرليات متكاملة للبث',        href:'/stream'},
            {icon:'fas fa-box-open',   title:'Stream Package',  desc:'باكدج بث شامل ومتكامل',       href:'/stream'},
            {icon:'fab fa-discord',    title:'Discord',         desc:'إعداد وتصميم سيرفر كامل',     href:'/contact'},
            {icon:'fa-solid fa-cube',  title:'3D Design',       desc:'تصاميم ثلاثية الأبعاد',       href:'/3d'},
            {icon:'fas fa-paint-brush',title:'Logo & Branding', desc:'هوية بصرية احترافية',          href:'/contact'},
          ].map((s,i)=>(
            <Link key={i} href={s.href} className="v2-srv-card rv" data-delay={String(i*80)}>
              <div className="v2-srv-icon"><i className={s.icon}/></div>
              <div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Us */}
      <section className="v2-why">
        <div className="v2-why-head rv" data-delay="0">
          <span className="v2-tag">ليش تيلاجو؟</span>
          <h2>نقدم أكثر من مجرد تصميم</h2>
        </div>
        <div className="v2-why-grid">
          {[
            {icon:'fas fa-bolt',       title:'تسليم خلال 24 ساعة',   desc:'نلتزم بالوقت — تصميمك جاهز وبأعلى جودة في أسرع وقت'},
            {icon:'fas fa-fingerprint',title:'تصاميم حصرية لك',      desc:'كل تصميم فريد ولا يتكرر مع أي قناة أو مشترك آخر'},
            {icon:'fas fa-headset',    title:'دعم فني مستمر',         desc:'نساعدك في التركيب والإعداد على OBS وStreamlabs وغيرها'},
            {icon:'fas fa-sliders-h',  title:'تخصيص كامل',            desc:'ألوانك، اسمك، أسلوبك — نعدّل كل تفصيلة حسب طلبك'},
          ].map((w,i)=>(
            <div key={i} className="v2-why-card rv" data-delay={String(i*100)}>
              <div className="v2-why-icon"><i className={w.icon}/></div>
              <h3>{w.title}</h3>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="v2-stats rv" data-delay="0">
        <div className="v2-stats-grid">
          {[
            {num:'500+',lbl:'عميل راضي'},
            {num:'200+',lbl:'تصميم منجز'},
            {num:'24/7',lbl:'دعم فني'},
            {num:'100%',lbl:'ضمان الجودة'},
          ].map((s,i)=>(
            <div key={i} className="v2-stat rv-scale" data-delay={String(i*120)}>
              <span className="v2-stat-num">{s.num}</span>
              <span className="v2-stat-lbl">{s.lbl}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="v2-cta rv" data-delay="0">
        <h2>جاهز تبدأ مشروعك؟</h2>
        <p>تواصل معنا الآن وسنحوّل فكرتك إلى تصميم احترافي</p>
        <div className="v2-cta-btns">
          <Link href="/alerts" className="v2-cta-btn primary">
            <i className="fas fa-shopping-bag"/> تصفح المتجر
          </Link>
          <Link href="/contact" className="v2-cta-btn secondary">
            <i className="fas fa-headset"/> تواصل معنا
          </Link>
        </div>
      </section>
    </div>
  );
}

'use client';

import { useState } from 'react';
import type { DevCategory, DevProject, DevContact } from '@/lib/developerContent';

export default function DevServices({ categories, contacts, orderWhatsapp }: {
  categories: DevCategory[];
  contacts: DevContact[];
  orderWhatsapp: string;
}) {
  const [cat, setCat] = useState<DevCategory | null>(null);         // مشاريع قسم مفتوح
  const [project, setProject] = useState<DevProject | null>(null);  // تفاصيل مشروع
  const [slide, setSlide] = useState(0);

  const openProject = (p: DevProject) => { setProject(p); setSlide(0); };
  const closeAll = () => { setProject(null); setCat(null); };
  const orderHref = (name: string) => `${orderWhatsapp}?text=${encodeURIComponent('مهتم بمشروع: ' + name)}`;

  return (
    <>
      <style>{`
        .dvp-grid{max-width:1180px;margin:0 auto;padding:0 5% 10px;display:grid;gap:1.4rem;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));}
        .dvp-card{background:rgba(15,8,59,0.55);border:1px solid rgba(84,22,181,0.2);border-radius:20px;overflow:hidden;
          display:flex;flex-direction:column;transition:transform .3s cubic-bezier(.25,.8,.25,1),border-color .3s,box-shadow .3s;}
        .dvp-card:hover{transform:translateY(-8px);border-color:rgba(155,89,208,0.5);box-shadow:0 16px 34px rgba(0,0,0,0.35);}
        .dvp-media{position:relative;height:180px;overflow:hidden;background:#0a0420;}
        .dvp-media img{width:100%;height:100%;object-fit:cover;transition:transform .5s;}
        .dvp-card:hover .dvp-media img{transform:scale(1.06);}
        .dvp-media-grad{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,3,20,0.96) 0%,rgba(8,3,20,0.35) 55%,transparent);}
        .dvp-media-title{position:absolute;bottom:14px;right:16px;left:16px;display:flex;align-items:center;gap:10px;}
        .dvp-media-ic{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:1.05rem;flex-shrink:0;}
        .dvp-media-name{font-family:'Oxanium','29LtBukra',sans-serif;font-weight:800;font-size:1.15rem;color:#fff;}
        .dvp-body{padding:1.3rem 1.4rem 1.5rem;display:flex;flex-direction:column;flex:1;}
        .dvp-body p{color:rgba(180,168,215,0.62);font-size:.88rem;line-height:1.8;margin:0 0 1.3rem;flex:1;}
        .dvp-view{display:flex;align-items:center;justify-content:center;gap:9px;padding:.8rem 1rem;border-radius:12px;cursor:pointer;
          font-family:inherit;font-weight:800;font-size:.92rem;border:none;color:#fff;background:linear-gradient(135deg,#5416B5,#7F3AA1);
          box-shadow:0 6px 18px rgba(0,0,0,0.3);transition:transform .25s;}
        .dvp-view:hover{transform:translateY(-2px);}

        /* ── Drawer ── */
        .dvp-backdrop{position:fixed;inset:0;z-index:1000;background:rgba(4,1,12,0.78);backdrop-filter:blur(6px);
          display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:2rem 1rem;animation:dvpFade .25s ease;}
        @keyframes dvpFade{from{opacity:0}to{opacity:1}}
        .dvp-panel{width:100%;max-width:920px;background:linear-gradient(180deg,#0d0620,#0a0514);border:1px solid rgba(84,22,181,0.35);
          border-radius:22px;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,0.85);animation:dvpUp .3s cubic-bezier(.25,.8,.25,1);}
        @keyframes dvpUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
        .dvp-phead{display:flex;align-items:center;gap:12px;padding:1.1rem 1.5rem;border-bottom:1px solid rgba(84,22,181,0.2);background:rgba(84,22,181,0.06);}
        .dvp-phead-ic{width:36px;height:36px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;}
        .dvp-phead h3{flex:1;font-family:'Oxanium','29LtBukra',sans-serif;font-weight:800;font-size:1.05rem;color:#f0ecff;margin:0;}
        .dvp-x{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);
          color:rgba(200,185,230,0.75);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .dvp-x:hover{background:rgba(255,255,255,0.12);color:#fff;}

        /* projects grid inside drawer */
        .dvp-plist{padding:1.4rem 1.5rem;display:grid;gap:1.1rem;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));}
        .dvp-pcard{background:rgba(84,22,181,0.07);border:1px solid rgba(84,22,181,0.2);border-radius:16px;overflow:hidden;
          display:flex;flex-direction:column;transition:transform .25s,border-color .25s;}
        .dvp-pcard:hover{transform:translateY(-4px);border-color:rgba(155,89,208,0.45);}
        .dvp-pcard-img{height:130px;background:#0a0420;overflow:hidden;}
        .dvp-pcard-img img{width:100%;height:100%;object-fit:cover;}
        .dvp-pcard-body{padding:1rem 1.1rem 1.2rem;display:flex;flex-direction:column;flex:1;}
        .dvp-pcard-body h4{font-family:'Oxanium','29LtBukra',sans-serif;font-weight:800;font-size:1rem;color:#f0ecff;margin:0 0 .5rem;}
        .dvp-pcard-body p{color:rgba(180,168,215,0.55);font-size:.8rem;line-height:1.6;margin:0 0 1rem;flex:1;}
        .dvp-pview{padding:.6rem;border-radius:10px;border:1px solid rgba(155,89,208,0.4);background:rgba(84,22,181,0.16);
          color:#c8b8f0;font-family:inherit;font-weight:700;font-size:.82rem;cursor:pointer;transition:all .2s;text-align:center;}
        .dvp-pview:hover{background:rgba(84,22,181,0.3);color:#fff;}

        /* project detail */
        .dvp-detail{padding:1.4rem 1.5rem 1.6rem;}
        .dvp-gallery{position:relative;border-radius:16px;overflow:hidden;background:#05030f;aspect-ratio:16/9;}
        .dvp-gallery img{width:100%;height:100%;object-fit:cover;display:block;}
        .dvp-gnav{position:absolute;top:50%;transform:translateY(-50%);width:40px;height:40px;border-radius:50%;
          background:rgba(0,0,0,0.55);border:1px solid rgba(255,255,255,0.14);color:#fff;cursor:pointer;
          display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);}
        .dvp-gnav.prev{right:12px;} .dvp-gnav.next{left:12px;}
        .dvp-gcount{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.6);
          border-radius:50px;padding:.2rem .8rem;font-size:.75rem;color:rgba(255,255,255,0.7);}
        .dvp-thumbs{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;}
        .dvp-thumb{width:64px;height:44px;border-radius:8px;overflow:hidden;cursor:pointer;border:2px solid transparent;flex-shrink:0;}
        .dvp-thumb.on{border-color:#7F3AA1;}
        .dvp-thumb img{width:100%;height:100%;object-fit:cover;}
        .dvp-detail-desc{color:rgba(200,190,225,0.7);font-size:.92rem;line-height:1.9;margin:1.2rem 0;}
        .dvp-actions{display:flex;flex-direction:column;gap:10px;}
        .dvp-visit{display:flex;align-items:center;justify-content:center;gap:9px;padding:.85rem;border-radius:12px;text-decoration:none;
          font-weight:800;font-size:.9rem;color:#c8b8f0;background:rgba(84,22,181,0.16);border:1px solid rgba(155,89,208,0.4);transition:all .2s;}
        .dvp-visit:hover{background:rgba(84,22,181,0.3);color:#fff;}
        .dvp-order{display:flex;align-items:center;justify-content:center;gap:10px;padding:.9rem;border-radius:12px;text-decoration:none;
          font-weight:800;font-size:.95rem;color:#fff;background:linear-gradient(135deg,#5416B5,#7F3AA1);box-shadow:0 6px 18px rgba(0,0,0,0.3);transition:transform .2s;}
        .dvp-order:hover{transform:translateY(-2px);}
        .dvp-contacts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:4px;}
        @media(max-width:480px){.dvp-contacts{grid-template-columns:1fr;}}
        .dvp-ct{display:flex;align-items:center;justify-content:center;gap:8px;padding:.75rem;border-radius:12px;text-decoration:none;
          font-weight:700;font-size:.85rem;color:#e8e4f8;background:rgba(15,8,59,0.6);border:1px solid rgba(84,22,181,0.25);transition:all .2s;}
        .dvp-ct:hover{transform:translateY(-2px);border-color:rgba(155,89,208,0.5);}
        .dvp-order-label{font-size:.72rem;color:rgba(155,89,208,0.6);text-align:center;margin:16px 0 8px;letter-spacing:2px;text-transform:uppercase;font-weight:700;}
      `}</style>

      {/* ── Service cards ── */}
      <div className="dvp-grid">
        {categories.map(c => (
          <div key={c.id} className="dvp-card">
            <div className="dvp-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {c.cover && <img src={c.cover} alt={c.title} />}
              <div className="dvp-media-grad" />
              <div className="dvp-media-title">
                <span className="dvp-media-ic" style={{ background: `${c.color}22`, color: c.color, border: `1px solid ${c.color}55` }}><i className={c.icon} /></span>
                <span className="dvp-media-name">{c.title}</span>
              </div>
            </div>
            <div className="dvp-body">
              <p>{c.desc}</p>
              <button className="dvp-view" onClick={() => { setCat(c); setProject(null); }}>
                <i className="fas fa-folder-open" /> عرض المشاريع
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Category projects drawer ── */}
      {cat && !project && (
        <div className="dvp-backdrop" onClick={e => { if (e.target === e.currentTarget) closeAll(); }}>
          <div className="dvp-panel">
            <div className="dvp-phead">
              <span className="dvp-phead-ic" style={{ background: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.color}55` }}><i className={cat.icon} /></span>
              <h3>مشاريع {cat.title}</h3>
              <button className="dvp-x" onClick={closeAll} aria-label="إغلاق"><i className="fas fa-times" /></button>
            </div>
            {cat.projects.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'rgba(155,89,208,0.4)' }}>لا توجد مشاريع في هذا القسم بعد.</div>
            ) : (
              <div className="dvp-plist">
                {cat.projects.map(p => (
                  <div key={p.id} className="dvp-pcard">
                    <div className="dvp-pcard-img">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.images?.[0] && <img src={p.images[0]} alt={p.title} />}
                    </div>
                    <div className="dvp-pcard-body">
                      <h4>{p.title}</h4>
                      <p>{p.desc}</p>
                      <button className="dvp-pview" onClick={() => openProject(p)}>عرض</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Project detail drawer ── */}
      {project && (
        <div className="dvp-backdrop" onClick={e => { if (e.target === e.currentTarget) closeAll(); }}>
          <div className="dvp-panel">
            <div className="dvp-phead">
              <button className="dvp-x" onClick={() => setProject(null)} aria-label="رجوع"><i className="fas fa-arrow-right" /></button>
              <h3>{project.title}</h3>
              <button className="dvp-x" onClick={closeAll} aria-label="إغلاق"><i className="fas fa-times" /></button>
            </div>
            <div className="dvp-detail">
              <div className="dvp-gallery">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {project.images?.[slide] && <img src={project.images[slide]} alt={project.title} />}
                {project.images.length > 1 && (
                  <>
                    <button className="dvp-gnav prev" onClick={() => setSlide(s => (s + 1) % project.images.length)}><i className="fas fa-chevron-right" /></button>
                    <button className="dvp-gnav next" onClick={() => setSlide(s => (s - 1 + project.images.length) % project.images.length)}><i className="fas fa-chevron-left" /></button>
                    <div className="dvp-gcount">{slide + 1} / {project.images.length}</div>
                  </>
                )}
              </div>
              {project.images.length > 1 && (
                <div className="dvp-thumbs">
                  {project.images.map((img, i) => (
                    <div key={i} className={`dvp-thumb${i === slide ? ' on' : ''}`} onClick={() => setSlide(i)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" />
                    </div>
                  ))}
                </div>
              )}

              <p className="dvp-detail-desc">{project.desc}</p>

              <div className="dvp-actions">
                {project.link && (
                  <a className="dvp-visit" href={project.link} target="_blank" rel="noreferrer"><i className="fas fa-up-right-from-square" /> عرض المشروع مباشرة</a>
                )}
                <a className="dvp-order" href={orderHref(project.title)} target="_blank" rel="noreferrer"><i className="fas fa-cart-plus" /> اطلب مشروع زيّه</a>

                {contacts.length > 0 && <>
                  <div className="dvp-order-label">تواصل مع المطوّر</div>
                  <div className="dvp-contacts">
                    {contacts.map(ct => (
                      <a key={ct.id} className="dvp-ct" href={ct.href} target="_blank" rel="noreferrer">
                        <i className={ct.icon} style={{ color: ct.color }} /> {ct.label}
                      </a>
                    ))}
                  </div>
                </>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

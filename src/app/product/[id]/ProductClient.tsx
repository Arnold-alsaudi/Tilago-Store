'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { youtubeEmbedUrl, youtubeThumbnail, isYouTubeUrl } from '@/lib/youtube';
import type { Product } from '@/types';

export interface PProduct {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  price: number;
  priceLabel: string | null;
  category: string;
  subCategory: string | null;
  imageUrl: string;
  images: string[];
  videoUrl: string | null;
  rating: number;
  ratingCount: number;
  tags: string[];
}

const CAT: Record<string, { label: string; href: string }> = {
  ALERTS:  { label: 'الأليرتات', href: '/alerts' },
  STREAM:  { label: 'الستريم',   href: '/stream' },
  PACKAGE: { label: 'الباكدج',   href: '/stream' },
  THREE_D: { label: 'ثري دي',    href: '/3d' },
  VIDEO:   { label: 'فيديو',     href: '/video' },
};

const CONTACTS = [
  { icon: 'fab fa-whatsapp', label: 'اطلب الآن',     sub: 'تواصل معنا',       href: 'https://wa.me/1234567890',     c: '#25D366' },
  { icon: 'fab fa-telegram', label: 'تيليجرام',      sub: 'تواصل معنا',       href: 'https://t.me/yourchannel',     c: '#0088cc' },
  { icon: 'fab fa-discord',  label: 'ديسكورد',       sub: 'انضم للسيرفر',     href: 'https://discord.gg/yourserver',c: '#5865F2' },
  { icon: 'fas fa-headset',  label: 'خدمة العملاء',  sub: 'نرد خلال 24 ساعة', href: 'mailto:support@tilago.com',    c: '#9B59D0' },
];

type Media = { type: 'image' | 'video'; src: string };

export function ProductClient({ product }: { product: PProduct }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);
  const [shareMsg, setShareMsg] = useState('');

  const cat = CAT[product.category] ?? { label: product.category, href: '/' };

  const imgs = product.images?.length ? product.images : (product.imageUrl ? [product.imageUrl] : []);
  const media: Media[] = [
    ...imgs.filter(s => !isYouTubeUrl(s)).map(src => ({ type: 'image' as const, src })),
    ...(youtubeEmbedUrl(product.videoUrl) ? [{ type: 'video' as const, src: product.videoUrl! }] : []),
  ];
  const [active, setActive] = useState(0);
  const current = media[active];

  const priceText = product.priceLabel ?? formatPrice(product.price);
  const rating = Math.max(0, Math.min(5, Math.round(product.rating || 5)));

  const addToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category as Product['category'],
      imageUrl: product.imageUrl,
      videoUrl: product.videoUrl,
      tags: product.tags,
      featured: false,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: product.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareMsg('تم نسخ الرابط');
        setTimeout(() => setShareMsg(''), 1800);
      }
    } catch { /* المستخدم لغى المشاركة */ }
  };

  return (
    <div className="pd" dir="rtl">
      <style>{`
        .pd{min-height:100vh;background:linear-gradient(180deg,#0F083B,#0C0516);color:#d0cce8;
          font-family:'Cairo','29LtBukra','Montserrat',sans-serif;padding:0 0 4rem;}
        .pd-wrap{max-width:1200px;margin:0 auto;padding:1.5rem 5% 0;}

        /* breadcrumb */
        .pd-crumb{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:.82rem;
          color:rgba(180,168,215,.5);margin:1rem 0 1.6rem;}
        .pd-crumb a{color:rgba(180,168,215,.65);text-decoration:none;transition:color .2s;}
        .pd-crumb a:hover{color:#c8b8f0;}
        .pd-crumb i{font-size:.6rem;color:rgba(155,89,208,.4);}
        .pd-crumb .cur{color:#e8e2ff;font-weight:700;}

        .pd-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:2.4rem;align-items:start;}
        @media(max-width:880px){.pd-grid{grid-template-columns:1fr;gap:1.6rem;}}

        /* ── Gallery (right) ── */
        .pd-gallery{position:sticky;top:1.5rem;}
        @media(max-width:880px){.pd-gallery{position:static;}}
        .pd-main{position:relative;width:100%;aspect-ratio:1/1;border-radius:22px;overflow:hidden;
          background:radial-gradient(ellipse at 50% 35%,rgba(84,22,181,0.22),#0a0420 72%);
          border:1px solid rgba(155,89,208,0.25);box-shadow:0 24px 60px rgba(0,0,0,0.55);
          display:flex;align-items:center;justify-content:center;padding:18px;}
        .pd-main img{width:100%;height:100%;object-fit:cover;border-radius:14px;display:block;}
        .pd-main iframe{width:100%;height:100%;border:none;border-radius:14px;background:#000;}
        .pd-main .pd-empty{color:rgba(155,89,208,.4);font-size:3rem;}
        .pd-thumbs{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;}
        .pd-thumb{position:relative;width:76px;height:76px;border-radius:12px;overflow:hidden;cursor:pointer;
          border:2px solid transparent;background:#0a0420;transition:border-color .2s,transform .2s;flex-shrink:0;}
        .pd-thumb:hover{transform:translateY(-2px);}
        .pd-thumb.on{border-color:#7F3AA1;box-shadow:0 0 0 1px rgba(155,89,208,.4);}
        .pd-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
        .pd-thumb .play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
          background:rgba(0,0,0,.4);color:#fff;font-size:1rem;}

        /* ── Details (left) ── */
        .pd-cat{display:inline-block;font-family:'Oxanium',sans-serif;font-size:.66rem;font-weight:700;
          letter-spacing:3px;text-transform:uppercase;color:rgba(196,160,224,.8);padding:.32rem 1rem;
          border-radius:50px;border:1px solid rgba(155,89,208,.25);background:rgba(84,22,181,.08);margin-bottom:1rem;}
        .pd-title{font-family:'Oxanium','29LtBukra',sans-serif;font-weight:900;font-size:clamp(1.7rem,3.6vw,2.6rem);
          color:#f0ecff;line-height:1.15;margin:0 0 .7rem;text-wrap:balance;}
        .pd-rating{display:flex;align-items:center;gap:8px;margin-bottom:.9rem;font-size:.9rem;color:rgba(180,168,215,.6);}
        .pd-stars{color:#F0830B;letter-spacing:2px;}
        .pd-price{font-family:'Oxanium',sans-serif;font-size:2rem;font-weight:800;
          background:linear-gradient(135deg,#c084f5,#9B59D0);-webkit-background-clip:text;background-clip:text;
          -webkit-text-fill-color:transparent;margin-bottom:1.2rem;}
        .pd-desc{font-size:.95rem;line-height:1.9;color:rgba(200,190,225,.75);margin-bottom:1.4rem;}

        .pd-features{background:rgba(15,8,59,0.5);border:1px solid rgba(84,22,181,.18);border-radius:16px;
          padding:1.2rem 1.4rem;margin-bottom:1.2rem;}
        .pd-features h3{font-family:'Oxanium',sans-serif;font-size:1rem;font-weight:700;color:#e8e2ff;
          margin:0 0 .8rem;display:flex;align-items:center;gap:8px;}
        .pd-features ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.6rem;}
        .pd-features li{font-size:.9rem;color:rgba(200,190,225,.8);padding-inline-start:1.6rem;position:relative;line-height:1.6;}
        .pd-features li::before{content:'✦';position:absolute;right:0;top:.05rem;color:#9B59D0;font-size:.8rem;}
        .pd-warn{color:#e06a6a;font-size:.82rem;margin-bottom:1.4rem;}

        .pd-actions{display:flex;gap:10px;align-items:stretch;margin-bottom:1.4rem;}
        .pd-cart{flex:1;display:flex;align-items:center;justify-content:center;gap:9px;padding:.95rem 1rem;
          border:none;border-radius:14px;cursor:pointer;font-family:'Cairo',sans-serif;font-size:1rem;font-weight:700;
          background:linear-gradient(135deg,#5416B5,#7F3AA1);color:#fff;box-shadow:0 6px 20px rgba(84,22,181,.4);transition:all .25s;}
        .pd-cart:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(84,22,181,.55);}
        .pd-cart.added{background:linear-gradient(135deg,#1e8e4f,#27ae60);box-shadow:none;}
        .pd-icon-btn{width:52px;flex-shrink:0;border-radius:14px;border:1px solid rgba(84,22,181,.35);
          background:rgba(84,22,181,.12);color:#c4a0e0;font-size:1.1rem;cursor:pointer;transition:all .25s;
          display:flex;align-items:center;justify-content:center;position:relative;}
        .pd-icon-btn:hover{background:rgba(84,22,181,.28);color:#fff;transform:translateY(-2px);}
        .pd-icon-btn.on{color:#ff5c8a;border-color:rgba(255,92,138,.45);background:rgba(255,92,138,.12);}
        .pd-toast{position:absolute;bottom:-30px;right:50%;transform:translateX(50%);white-space:nowrap;
          font-size:.7rem;background:rgba(12,5,22,.95);border:1px solid rgba(84,22,181,.4);color:#c8b8f0;
          padding:.25rem .6rem;border-radius:6px;}

        .pd-contacts{display:grid;grid-template-columns:1fr 1fr;gap:.7rem;}
        @media(max-width:420px){.pd-contacts{grid-template-columns:1fr;}}
        .pd-contact{display:flex;align-items:center;gap:12px;padding:.8rem 1rem;border-radius:14px;
          background:rgba(10,4,22,.6);border:1px solid rgba(84,22,181,.2);color:#d0cce8;text-decoration:none;transition:all .25s;}
        .pd-contact:hover{border-color:rgba(155,89,208,.45);transform:translateY(-2px);background:rgba(22,8,50,.8);}
        .pd-contact-ic{width:40px;height:40px;border-radius:11px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.15rem;}
        .pd-contact-t{display:flex;flex-direction:column;gap:1px;}
        .pd-contact-l{font-size:.86rem;font-weight:700;color:#ece8ff;}
        .pd-contact-s{font-size:.68rem;color:rgba(170,160,205,.5);}
      `}</style>

      <div className="pd-wrap">
        {/* Breadcrumb */}
        <nav className="pd-crumb">
          <Link href="/">الرئيسية</Link>
          <i className="fas fa-chevron-left" />
          <Link href={cat.href}>{cat.label}</Link>
          <i className="fas fa-chevron-left" />
          <span className="cur">{product.title}</span>
        </nav>

        <div className="pd-grid">
          {/* Gallery */}
          <div className="pd-gallery">
            <div className="pd-main">
              {current?.type === 'video' ? (
                <iframe src={youtubeEmbedUrl(current.src, { autoplay: false })!} title={product.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : current ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.src} alt={product.title} />
              ) : (
                <div className="pd-empty"><i className="fas fa-image" /></div>
              )}
            </div>
            {media.length > 1 && (
              <div className="pd-thumbs">
                {media.map((m, i) => (
                  <div key={i} className={`pd-thumb${i === active ? ' on' : ''}`} onClick={() => setActive(i)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.type === 'video' ? (youtubeThumbnail(m.src) ?? '') : m.src} alt="" />
                    {m.type === 'video' && <div className="play"><i className="fas fa-play" /></div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="pd-details">
            <span className="pd-cat">{product.subCategory || cat.label}</span>
            <h1 className="pd-title">{product.title}</h1>

            <div className="pd-rating">
              <span className="pd-stars">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
              <span>({product.ratingCount} تقييمات)</span>
            </div>

            <div className="pd-price">{priceText}</div>

            {product.description && <p className="pd-desc">{product.description}</p>}

            <div className="pd-features">
              <h3><i className="fas fa-sparkles" /> مميزات الأليرت</h3>
              <ul>
                <li>إضافة الشعار الخاص بك أو كتابة اسمك على الأليرت</li>
                <li>التسليم من ساعة إلى 24 ساعة من وقت الطلب</li>
                <li>متوافق مع OBS Studio و Streamlabs</li>
                <li>جودة عالية — يدعم الخلفية الشفافة (WebM)</li>
              </ul>
            </div>

            <p className="pd-warn">المنتج حق للمشتري فقط، ولا يُسمح بإعادة بيعه لشخص آخر.</p>

            <div className="pd-actions">
              <button className={`pd-cart${added ? ' added' : ''}`} onClick={addToCart}>
                {added ? <>✓ تمت الإضافة للسلة</> : <><i className="fas fa-cart-plus" /> أضف للسلة</>}
              </button>
              <button className={`pd-icon-btn${wished ? ' on' : ''}`} onClick={() => setWished(w => !w)} aria-label="المفضلة">
                <i className={wished ? 'fas fa-heart' : 'far fa-heart'} />
              </button>
              <button className="pd-icon-btn" onClick={share} aria-label="مشاركة">
                <i className="fas fa-share-alt" />
                {shareMsg && <span className="pd-toast">{shareMsg}</span>}
              </button>
            </div>

            <div className="pd-contacts">
              {CONTACTS.map(c => (
                <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="pd-contact">
                  <div className="pd-contact-ic" style={{ background: `${c.c}18`, color: c.c }}>
                    <i className={c.icon} />
                  </div>
                  <div className="pd-contact-t">
                    <span className="pd-contact-l">{c.label}</span>
                    <span className="pd-contact-s">{c.sub}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { youtubeEmbedUrl } from '@/lib/youtube';
import { mediaKind, videoPoster } from '@/lib/media';
import { colorMeta, DEFAULT_UNAVAILABLE_LABEL } from '@/lib/alertCode';
import type { Product } from '@/types';

export interface PProduct {
  id: string;
  slug: string | null;
  code: string | null;
  colorKey: string | null;
  comingSoon: boolean;
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
  VIDEO:   { label: 'فيديو',     href: '/videos' },
};

const CONTACTS = [
  { icon: 'fab fa-whatsapp', label: 'اطلب الآن',     sub: 'تواصل معنا',       href: 'https://wa.me/1234567890',     c: '#25D366' },
  { icon: 'fab fa-telegram', label: 'تيليجرام',      sub: 'تواصل معنا',       href: 'https://t.me/yourchannel',     c: '#0088cc' },
  { icon: 'fab fa-discord',  label: 'ديسكورد',       sub: 'انضم للسيرفر',     href: 'https://discord.gg/yourserver',c: '#5865F2' },
  // واتساب/تيليجرام/ديسكورد بألوانهم الرسمية عشان يتعرفوا فوراً — والدعم بلون اللوحة
  { icon: 'fas fa-headset',  label: 'خدمة العملاء',  sub: 'نرد خلال 24 ساعة', href: 'mailto:support@tilago.com',    c: '#7F3AA1' },
];

type Media = { type: 'image' | 'video' | 'youtube'; src: string };

export function ProductClient({ product }: { product: PProduct }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [logoUrl, setLogoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [custName, setCustName] = useState('');
  const [contact, setContact] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [soonLabel, setSoonLabel] = useState(DEFAULT_UNAVAILABLE_LABEL);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!product.comingSoon) return;
    fetch('/api/settings')
      .then(r => r.json())
      .then(s => { if (s.unavailableLabel) setSoonLabel(s.unavailableLabel); })
      .catch(() => {});
  }, [product.comingSoon]);

  const cat = CAT[product.category] ?? { label: product.category, href: '/' };

  const imgs = product.images?.length ? product.images : (product.imageUrl ? [product.imageUrl] : []);
  // كل الوسائط بالترتيب (صورة/فيديو محلي/يوتيوب)
  const media: Media[] = imgs.map(src => ({ type: mediaKind(src), src }));
  // ألحق فيديو يوتيوب المنفصل لو مش موجود ضمن الصور
  if (product.videoUrl && !imgs.includes(product.videoUrl) && mediaKind(product.videoUrl) !== 'image') {
    media.push({ type: mediaKind(product.videoUrl), src: product.videoUrl });
  }
  const [active, setActive] = useState(0);
  const current = media[active];

  const priceText = product.priceLabel ?? formatPrice(product.price);
  const rating = Math.max(0, Math.min(5, Math.round(product.rating || 5)));

  const cartProduct = {
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
  } as Product;

  const addN = (qty: number) => {
    const customization = { logoUrl, name: custName.trim(), contact: contact.trim() };
    for (let i = 0; i < qty; i++) addItem(cartProduct, customization);
  };

  const hasCustomization = () => !!(logoUrl || custName.trim());

  // يبعت الشعار + الاسم + وسيلة التواصل للأدمن عند الشراء
  const sendCustomization = () => {
    if (!hasCustomization()) return;
    fetch('/api/product/custom-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: product.title,
        quantity,
        amount: product.price * quantity,
        currency: 'EGP',
        name: custName.trim(),
        contact: contact.trim(),
        logoUrl,
        // السيرفر بيبني الاسم بكود المنتج من الداتابيز
        items: [{ productId: product.code ?? product.slug ?? product.id, quantity }],
      }),
    }).catch(() => {});
  };

  // التخصيص إجباري: لازم (شعار أو اسم) + وسيلة تواصل قبل الشراء
  const validateForm = () => {
    if (!logoUrl && !custName.trim()) {
      setFormErr('ارفع شعارك أو اكتب اسمك — لازم واحد منهم');
      document.querySelector('.pd-custom')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    if (!contact.trim()) {
      setFormErr('اكتب وسيلة التواصل — مطلوبة');
      document.querySelector('.pd-custom')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  };

  const addToCart = () => {
    if (!validateForm()) return;
    sendCustomization();
    addN(quantity); setAdded(true); setTimeout(() => setAdded(false), 1800);
  };
  const buyNow = () => {
    if (!validateForm()) return;
    sendCustomization();
    addN(quantity); router.push('/cart');
  };

  const uploadLogo = async (file: File) => {
    setUploading(true); setFormErr('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload/logo', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (data.url) setLogoUrl(data.url as string);
      else setFormErr(data.error ?? 'تعذّر رفع الشعار');
    } catch {
      setFormErr('تعذّر رفع الشعار، حاول تاني');
    } finally {
      setUploading(false);
    }
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
        /* ── لوحة الألوان — أربع ألوان بس، بدون أي نيون ──
           التوهّج (box-shadow ملوّن) اتشال بالكامل واتبدل بحدود وظلال داكنة هادية.
           درجات النص بتيجي من لون فاتح واحد بشفافيات — مفيش بنفسجيات شاردة. */
        .pd{
          --v:#7F3AA1;            /* بنفسجي فاتح — الحدود والتمييز */
          --d:#5416B5;            /* بنفسجي غامق — التعبئة والأزرار */
          --bg1:#0F083B;          /* خلفية علوية */
          --bg2:#0C0516;          /* خلفية سفلية */
          --ink:#EDE9F7;          /* النص الأساسي */
          --ink-70:rgba(237,233,247,.70);
          --ink-55:rgba(237,233,247,.55);
          --ink-40:rgba(237,233,247,.40);
          --line:rgba(127,58,161,.28);   /* حد هادي من --v */
          --panel:rgba(15,8,59,.55);     /* خلفية الصناديق */
          --sunk:rgba(12,5,22,.55);      /* خلفية غاطسة (حقول/أزرار) */
        }
        .pd{min-height:100vh;background:linear-gradient(180deg,var(--bg1),var(--bg2));color:var(--ink-70);
          font-family:'Cairo','29LtBukra','Montserrat',sans-serif;padding:0 0 4rem;}
        .pd-wrap{max-width:1200px;margin:0 auto;padding:1.5rem 5% 0;}

        /* breadcrumb */
        .pd-crumb{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:.82rem;
          color:var(--ink-40);margin:1rem 0 1.6rem;}
        .pd-crumb a{color:var(--ink-55);text-decoration:none;transition:color .2s;}
        .pd-crumb a:hover{color:var(--ink);}
        .pd-crumb i{font-size:.6rem;color:var(--ink-40);}
        .pd-crumb .cur{color:var(--ink);font-weight:700;}

        .pd-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:2.4rem;align-items:start;}
        @media(max-width:880px){.pd-grid{grid-template-columns:1fr;gap:1.6rem;}}

        /* ── Gallery (right) ── */
        .pd-gallery{position:sticky;top:1.5rem;}
        @media(max-width:880px){.pd-gallery{position:static;}}
        .pd-main{position:relative;width:100%;aspect-ratio:1/1;border-radius:22px;overflow:hidden;
          background:var(--bg2);
          border:1px solid var(--line);box-shadow:0 24px 60px rgba(0,0,0,0.55);
          display:flex;align-items:center;justify-content:center;padding:18px;}
        .pd-main img{width:100%;height:100%;object-fit:cover;border-radius:14px;display:block;}
        .pd-main iframe{width:100%;height:100%;border:none;border-radius:14px;background:#000;}
        .pd-main .pd-empty{color:var(--ink-40);font-size:3rem;}
        /* زرار صغير بسيط في الجنب لتقليب الصور والفيديو — بدون توهج */
        .pd-nav{position:absolute;top:50%;left:10px;transform:translateY(-50%);z-index:6;
          width:28px;height:28px;min-height:28px;padding:0;border-radius:50%;cursor:pointer;
          border:1px solid rgba(255,255,255,.14);background:rgba(10,6,20,.5);
          color:rgba(220,214,240,.7);display:flex;align-items:center;justify-content:center;
          font-size:.72rem;transition:background .2s,color .2s;}
        .pd-nav:hover{background:rgba(10,6,20,.78);color:#fff;}
        .pd-thumbs{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;}
        .pd-thumb{position:relative;width:76px;height:76px;border-radius:12px;overflow:hidden;cursor:pointer;
          border:2px solid transparent;background:var(--bg2);transition:border-color .2s,transform .2s;flex-shrink:0;}
        .pd-thumb:hover{transform:translateY(-2px);}
        .pd-thumb.on{border-color:var(--v);}
        .pd-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
        .pd-thumb .play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
          background:rgba(0,0,0,.4);color:#fff;font-size:1rem;}

        /* ── Details (left) ── */
        /* صف الكود واللون فوق اسم المنتج */
        .pd-tagrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:.5rem;}
        .pd-code{font-family:'Oxanium',monospace;font-size:.72rem;font-weight:800;letter-spacing:1px;
          background:rgba(84,22,181,.24);border:1px solid var(--line);color:var(--ink);
          border-radius:7px;padding:.22rem .6rem;cursor:pointer;transition:all .2s;direction:ltr;
          display:inline-flex;align-items:center;gap:5px;}
        .pd-code:hover{background:rgba(84,22,181,.45);color:#fff;}
        .pd-code.copied{background:rgba(46,204,113,.18);border-color:rgba(46,204,113,.5);color:#7ef0a8;}
        .pd-colortag{display:inline-flex;align-items:center;gap:6px;font-size:.72rem;
          color:var(--ink-70);background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.08);border-radius:7px;padding:.22rem .6rem;}
        .pd-colortag span{width:10px;height:10px;border-radius:50%;display:inline-block;}
        /* شارة "لم يكتمل بعد" في صفحة المنتج */
        .pd-soon{display:flex;align-items:flex-start;gap:12px;margin:.9rem 0 1.1rem;
          background:rgba(240,131,11,.08);border:1px solid rgba(240,131,11,.4);
          border-radius:13px;padding:.9rem 1.1rem;}
        .pd-soon > i{color:#ffcf7a;font-size:1.1rem;margin-top:2px;flex-shrink:0;}
        .pd-soon div{display:flex;flex-direction:column;gap:3px;}
        .pd-soon b{color:#ffcf7a;font-size:.92rem;}
        .pd-soon span{color:rgba(200,190,225,.65);font-size:.8rem;line-height:1.6;}

        .pd-cat{display:inline-block;font-family:'Oxanium',sans-serif;font-size:.66rem;font-weight:700;
          letter-spacing:3px;text-transform:uppercase;color:var(--ink-70);padding:.32rem 1rem;
          border-radius:50px;border:1px solid var(--line);background:rgba(84,22,181,.10);margin-bottom:1rem;}
        .pd-title{font-family:'Oxanium','29LtBukra',sans-serif;font-weight:900;font-size:clamp(1.7rem,3.6vw,2.6rem);
          color:var(--ink);line-height:1.15;margin:0 0 .7rem;text-wrap:balance;}
        .pd-rating{display:flex;align-items:center;gap:8px;margin-bottom:.9rem;font-size:.9rem;color:var(--ink-55);}
        .pd-stars{color:#F0830B;letter-spacing:2px;}
        /* السعر بلون واحد صريح بدل التدرّج اللامع */
        .pd-price{font-family:'Oxanium',sans-serif;font-size:2rem;font-weight:800;
          color:var(--ink);margin-bottom:1.2rem;}
        .pd-desc{font-size:.95rem;line-height:1.9;color:var(--ink-70);margin-bottom:1.4rem;}

        .pd-features{background:var(--panel);border:1px solid var(--line);border-radius:16px;
          padding:1.2rem 1.4rem;margin-bottom:1.2rem;}
        .pd-features h3{font-family:'Oxanium',sans-serif;font-size:1rem;font-weight:700;color:var(--ink);
          margin:0 0 .8rem;display:flex;align-items:center;gap:8px;}
        .pd-features ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.6rem;}
        .pd-features li{font-size:.9rem;color:var(--ink-70);padding-inline-start:1.6rem;position:relative;line-height:1.6;}
        .pd-features li::before{content:'✦';position:absolute;right:0;top:.05rem;color:var(--v);font-size:.8rem;}
        .pd-warn{color:#e06a6a;font-size:.82rem;margin-bottom:1.4rem;}

        /* ── Customization ── */
        .pd-custom{background:var(--panel);border:1px solid var(--line);border-radius:16px;
          padding:1.3rem 1.4rem;margin-bottom:1.4rem;}
        .pd-custom h3{font-family:'Oxanium',sans-serif;font-size:1rem;font-weight:700;color:var(--ink);
          margin:0 0 .4rem;display:flex;align-items:center;gap:8px;}
        .pd-cust-lbl{display:block;font-size:.82rem;color:var(--ink-70);font-weight:700;margin:.9rem 0 .5rem;}
        .pd-cust-lbl .req{color:#e06a6a;}
        .pd-cust-hint{font-size:.78rem;color:var(--ink-55);margin:.2rem 0 .4rem;line-height:1.7;}
        .pd-cust-hint b{color:var(--ink);}
        .pd-drop{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:8px;
          min-height:110px;border:2px dashed var(--line);border-radius:12px;padding:12px;cursor:pointer;
          color:var(--ink-55);font-size:.85rem;transition:all .25s;background:var(--sunk);}
        .pd-drop:hover,.pd-drop.over{border-color:var(--v);background:rgba(84,22,181,.12);color:var(--ink);}
        .pd-drop.has{padding:8px;border-style:solid;}
        .pd-drop i{font-size:1.5rem;color:var(--v);}
        .pd-drop-preview{max-height:130px;max-width:100%;border-radius:8px;object-fit:contain;}
        .pd-drop-clear{margin-top:8px;background:none;border:none;color:#e06a6a;font-size:.78rem;cursor:pointer;
          display:inline-flex;align-items:center;gap:5px;font-family:'Cairo',sans-serif;}
        .pd-drop-clear:hover{color:#ff8080;}
        .pd-input{width:100%;padding:.7rem .9rem;border-radius:10px;border:1px solid var(--line);
          background:var(--sunk);color:var(--ink);font-size:.9rem;font-family:'Cairo',sans-serif;box-sizing:border-box;}
        .pd-input::placeholder{color:var(--ink-40);}
        .pd-input:focus{outline:none;border-color:var(--v);}
        .pd-cust-err{color:#e06a6a;font-size:.8rem;margin:.6rem 0 0;}

        .pd-qty-row{display:flex;align-items:center;gap:16px;margin-bottom:1rem;}
        .pd-qty-label{font-size:.9rem;color:var(--ink-70);font-weight:700;}
        .pd-qty{display:inline-flex;align-items:center;background:var(--sunk);
          border:1px solid var(--line);border-radius:12px;overflow:hidden;}
        .pd-qty button{width:42px;height:42px;border:none;background:transparent;color:var(--ink-70);
          font-size:1.3rem;cursor:pointer;transition:background .2s;line-height:1;}
        .pd-qty button:hover{background:rgba(84,22,181,.25);color:#fff;}
        .pd-qty-n{min-width:46px;text-align:center;font-family:'Oxanium',sans-serif;font-weight:700;
          font-size:1.05rem;color:var(--ink);font-variant-numeric:tabular-nums;}

        .pd-actions{display:flex;gap:10px;align-items:stretch;margin-bottom:1.1rem;flex-wrap:wrap;}
        /* لون مصمت بدل التدرّج، وظل داكن هادي بدل التوهّج البنفسجي */
        .pd-buynow{flex:1;min-width:150px;display:flex;align-items:center;justify-content:center;gap:9px;padding:.95rem 1rem;
          border:1px solid var(--v);border-radius:14px;cursor:pointer;font-family:'Cairo',sans-serif;font-size:1.02rem;font-weight:800;
          background:var(--d);color:#fff;transition:background .2s,border-color .2s;}
        .pd-buynow:hover{background:var(--v);}
        .pd-buynow i{color:#fff;}
        .pd-cart{flex:1;min-width:150px;display:flex;align-items:center;justify-content:center;gap:9px;padding:.95rem 1rem;
          border:1px solid var(--line);border-radius:14px;cursor:pointer;font-family:'Cairo',sans-serif;font-size:1rem;font-weight:700;
          background:transparent;color:var(--ink);transition:background .2s,border-color .2s;}
        .pd-cart:hover{background:rgba(84,22,181,.22);border-color:var(--v);}
        .pd-cart.added{background:rgba(46,204,113,.18);border-color:rgba(46,204,113,.5);color:#7ef0a8;}
        .pd-icon-btn{width:52px;flex-shrink:0;border-radius:14px;border:1px solid var(--line);
          background:transparent;color:var(--ink-70);font-size:1.1rem;cursor:pointer;transition:background .2s,border-color .2s,color .2s;
          display:flex;align-items:center;justify-content:center;position:relative;}
        .pd-icon-btn:hover{background:rgba(84,22,181,.22);border-color:var(--v);color:var(--ink);}
        .pd-icon-btn.on{color:#ff5c8a;border-color:rgba(255,92,138,.45);background:rgba(255,92,138,.12);}
        .pd-toast{position:absolute;bottom:-30px;right:50%;transform:translateX(50%);white-space:nowrap;
          font-size:.7rem;background:var(--bg2);border:1px solid var(--line);color:var(--ink);
          padding:.25rem .6rem;border-radius:6px;}

        .pd-pay{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:.9rem 0 1.3rem;
          margin-bottom:1.2rem;border-bottom:1px solid var(--line);}
        .pd-pay-label{display:inline-flex;align-items:center;gap:7px;font-size:.78rem;color:var(--ink-55);font-weight:700;}
        .pd-pay-label i{color:#7ef0a8;font-size:.72rem;}
        .pd-pay-icons{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
        .pd-pay-icons i{font-size:1.7rem;color:var(--ink-70);transition:color .2s;}
        .pd-pay-icons i:hover{color:var(--ink);}
        .pd-pay-txt{font-family:'Oxanium',sans-serif;font-size:.72rem;font-weight:800;letter-spacing:.5px;
          padding:.2rem .5rem;border-radius:5px;background:rgba(84,22,181,.2);color:var(--ink);border:1px solid var(--line);}

        .pd-contacts{display:grid;grid-template-columns:1fr 1fr;gap:.7rem;}
        @media(max-width:420px){.pd-contacts{grid-template-columns:1fr;}}
        .pd-contact{display:flex;align-items:center;gap:12px;padding:.8rem 1rem;border-radius:14px;
          background:var(--sunk);border:1px solid var(--line);color:var(--ink-70);text-decoration:none;
          transition:background .2s,border-color .2s;}
        .pd-contact:hover{border-color:var(--v);background:rgba(84,22,181,.18);}
        .pd-contact-ic{width:40px;height:40px;border-radius:11px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.15rem;}
        .pd-contact-t{display:flex;flex-direction:column;gap:1px;}
        .pd-contact-l{font-size:.86rem;font-weight:700;color:var(--ink);}
        .pd-contact-s{font-size:.68rem;color:var(--ink-40);}
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
              {current?.type === 'youtube' ? (
                <iframe src={youtubeEmbedUrl(current.src, { autoplay: false })!} title={product.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : current?.type === 'video' ? (
                <video src={current.src} controls playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000', borderRadius: 14 }} />
              ) : current ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.src} alt={product.title} />
              ) : (
                <div className="pd-empty"><i className="fas fa-image" /></div>
              )}
              {media.length > 1 && (
                <button className="pd-nav" onClick={() => setActive(a => (a + 1) % media.length)} aria-label="العنصر التالي">
                  <i className="fas fa-chevron-left" />
                </button>
              )}
            </div>
            {media.length > 1 && (
              <div className="pd-thumbs">
                {media.map((m, i) => (
                  <div key={i} className={`pd-thumb${i === active ? ' on' : ''}`} onClick={() => setActive(i)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.type === 'image' ? m.src : (videoPoster(m.src) ?? '')} alt="" />
                    {m.type !== 'image' && <div className="play"><i className="fas fa-play" /></div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="pd-details">
            <div className="pd-tagrow">
              <span className="pd-cat">{product.subCategory || cat.label}</span>
              {product.code && (
                <button
                  className={`pd-code${codeCopied ? ' copied' : ''}`}
                  onClick={() => {
                    navigator.clipboard?.writeText(product.code!).then(
                      () => { setCodeCopied(true); setTimeout(() => setCodeCopied(false), 1400); },
                      () => {},
                    );
                  }}
                  title="اضغط لنسخ الكود"
                >
                  <i className="fas fa-hashtag" /> {codeCopied ? 'اتنسخ' : product.code}
                </button>
              )}
              {colorMeta(product.colorKey) && (
                <span className="pd-colortag">
                  <span style={{ background: colorMeta(product.colorKey)!.hex }} />
                  {colorMeta(product.colorKey)!.label}
                </span>
              )}
            </div>
            <h1 className="pd-title">{product.title}</h1>

            {product.comingSoon && (
              <div className="pd-soon">
                <i className="fas fa-clock" />
                <div>
                  <b>{soonLabel}</b>
                  <span>الاليرت ده لسه بيتجهّز — تقدر تشوفه دلوقتي وهنفتحه للشراء قريب.</span>
                </div>
              </div>
            )}

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

            {/* Customization */}
            <div className="pd-custom">
              <h3><i className="fas fa-paint-brush" />ارفع صورة للشعار الخاص بك</h3>
              <p className="pd-cust-hint">مطلوب قبل الشراء: <b>الشعار أو الاسم</b> (واحد منهم على الأقل) + <b>وسيلة التواصل</b>.</p>

              <label className="pd-cust-lbl">ارفع صورة الشعار الخاص بك</label>
              <div className={`pd-drop${dragOver ? ' over' : ''}${logoUrl ? ' has' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) uploadLogo(f); }}
                onClick={() => fileRef.current?.click()}
              >
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="pd-drop-preview" src={logoUrl} alt="الشعار" />
                ) : uploading ? (
                  <span><i className="fas fa-spinner fa-spin" /> جارٍ الرفع...</span>
                ) : (
                  <span><i className="fas fa-cloud-upload-alt" /> اسحب وأفلت الشعار هنا، أو اضغط للاستعراض</span>
                )}
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }} />
              </div>
              {logoUrl && (
                <button className="pd-drop-clear" onClick={() => setLogoUrl('')}>
                  <i className="fas fa-times" /> إزالة الشعار
                </button>
              )}

              <label className="pd-cust-lbl">ماعندك شعار؟ اكتب اسمك ونحطّه لك</label>
              <input className="pd-input" value={custName} onChange={e => setCustName(e.target.value)} placeholder="مثال: Tilago" />

              <label className="pd-cust-lbl">وسيلة التواصل <span className="req">*</span></label>
              <input className="pd-input" value={contact}
                onChange={e => { setContact(e.target.value); setFormErr(''); }}
                placeholder="تيليجرام / ديسكورد / واتساب" />

              {formErr && <p className="pd-cust-err">{formErr}</p>}
            </div>

            <p className="pd-warn">المنتج حق للمشتري فقط، ولا يُسمح بإعادة بيعه لشخص آخر.</p>

            {/* Quantity */}
            <div className="pd-qty-row">
              <span className="pd-qty-label">الكمية</span>
              <div className="pd-qty">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="أقل">−</button>
                <span className="pd-qty-n">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(99, q + 1))} aria-label="أكثر">+</button>
              </div>
            </div>

            {/* Buy buttons */}
            <div className="pd-actions">
              {product.comingSoon ? (
                <button className="pd-buynow" disabled style={{ opacity: .5, cursor: 'not-allowed' }}>
                  <i className="fas fa-clock" /> {soonLabel}
                </button>
              ) : (
                <>
                  <button className="pd-buynow" onClick={buyNow}>
                    <i className="fas fa-bolt" /> اشتري الآن
                  </button>
                  <button className={`pd-cart${added ? ' added' : ''}`} onClick={addToCart}>
                    {added ? <>✓ تمت الإضافة</> : <><i className="fas fa-cart-plus" /> أضف للسلة</>}
                  </button>
                </>
              )}
              <button className={`pd-icon-btn${wished ? ' on' : ''}`} onClick={() => setWished(w => !w)} aria-label="المفضلة">
                <i className={wished ? 'fas fa-heart' : 'far fa-heart'} />
              </button>
              <button className="pd-icon-btn" onClick={share} aria-label="مشاركة">
                <i className="fas fa-share-alt" />
                {shareMsg && <span className="pd-toast">{shareMsg}</span>}
              </button>
            </div>

            {/* Payment methods */}
            <div className="pd-pay">
              <span className="pd-pay-label"><i className="fas fa-lock" /> دفع آمن عبر</span>
              <div className="pd-pay-icons">
                <i className="fab fa-cc-visa" title="Visa" />
                <i className="fab fa-cc-mastercard" title="Mastercard" />
                <span className="pd-pay-txt">mada</span>
                <i className="fab fa-apple-pay" title="Apple Pay" />
                <i className="fab fa-cc-paypal" title="PayPal" />
                <span className="pd-pay-txt">Meeza</span>
              </div>
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

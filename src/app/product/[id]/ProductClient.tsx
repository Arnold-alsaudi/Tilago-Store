'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { youtubeEmbedUrl } from '@/lib/youtube';
import { mediaKind, videoPoster } from '@/lib/media';
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
  const fileRef = useRef<HTMLInputElement>(null);

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

        /* ── Customization ── */
        .pd-custom{background:rgba(15,8,59,0.5);border:1px solid rgba(84,22,181,.2);border-radius:16px;
          padding:1.3rem 1.4rem;margin-bottom:1.4rem;}
        .pd-custom h3{font-family:'Oxanium',sans-serif;font-size:1rem;font-weight:700;color:#e8e2ff;
          margin:0 0 .4rem;display:flex;align-items:center;gap:8px;}
        .pd-cust-lbl{display:block;font-size:.82rem;color:rgba(200,190,225,.72);font-weight:700;margin:.9rem 0 .5rem;}
        .pd-cust-lbl .req{color:#e06a6a;}
        .pd-cust-hint{font-size:.78rem;color:rgba(180,168,215,.6);margin:.2rem 0 .4rem;line-height:1.7;}
        .pd-cust-hint b{color:#c8b8f0;}
        .pd-drop{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:8px;
          min-height:110px;border:2px dashed rgba(155,89,208,.4);border-radius:12px;padding:12px;cursor:pointer;
          color:rgba(180,168,215,.7);font-size:.85rem;transition:all .25s;background:rgba(10,4,22,.4);}
        .pd-drop:hover,.pd-drop.over{border-color:#7F3AA1;background:rgba(84,22,181,.12);color:#c8b8f0;}
        .pd-drop.has{padding:8px;border-style:solid;}
        .pd-drop i{font-size:1.5rem;color:#9B59D0;}
        .pd-drop-preview{max-height:130px;max-width:100%;border-radius:8px;object-fit:contain;}
        .pd-drop-clear{margin-top:8px;background:none;border:none;color:#e06a6a;font-size:.78rem;cursor:pointer;
          display:inline-flex;align-items:center;gap:5px;font-family:'Cairo',sans-serif;}
        .pd-drop-clear:hover{color:#ff8080;}
        .pd-input{width:100%;padding:.7rem .9rem;border-radius:10px;border:1px solid rgba(84,22,181,.3);
          background:rgba(0,0,0,.3);color:#f0ecff;font-size:.9rem;font-family:'Cairo',sans-serif;box-sizing:border-box;}
        .pd-input::placeholder{color:rgba(180,168,215,.4);}
        .pd-input:focus{outline:none;border-color:rgba(155,89,208,.6);}
        .pd-cust-err{color:#e06a6a;font-size:.8rem;margin:.6rem 0 0;}

        .pd-qty-row{display:flex;align-items:center;gap:16px;margin-bottom:1rem;}
        .pd-qty-label{font-size:.9rem;color:rgba(200,190,225,.7);font-weight:700;}
        .pd-qty{display:inline-flex;align-items:center;background:rgba(10,4,22,.6);
          border:1px solid rgba(84,22,181,.3);border-radius:12px;overflow:hidden;}
        .pd-qty button{width:42px;height:42px;border:none;background:transparent;color:#c4a0e0;
          font-size:1.3rem;cursor:pointer;transition:background .2s;line-height:1;}
        .pd-qty button:hover{background:rgba(84,22,181,.25);color:#fff;}
        .pd-qty-n{min-width:46px;text-align:center;font-family:'Oxanium',sans-serif;font-weight:700;
          font-size:1.05rem;color:#f0ecff;font-variant-numeric:tabular-nums;}

        .pd-actions{display:flex;gap:10px;align-items:stretch;margin-bottom:1.1rem;flex-wrap:wrap;}
        .pd-buynow{flex:1;min-width:150px;display:flex;align-items:center;justify-content:center;gap:9px;padding:.95rem 1rem;
          border:none;border-radius:14px;cursor:pointer;font-family:'Cairo',sans-serif;font-size:1.02rem;font-weight:800;
          background:linear-gradient(135deg,#5416B5,#7F3AA1);color:#fff;box-shadow:0 6px 22px rgba(84,22,181,.45);transition:all .25s;}
        .pd-buynow:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(84,22,181,.6);}
        .pd-buynow i{color:#ffcf7a;}
        .pd-cart{flex:1;min-width:150px;display:flex;align-items:center;justify-content:center;gap:9px;padding:.95rem 1rem;
          border:1px solid rgba(155,89,208,.4);border-radius:14px;cursor:pointer;font-family:'Cairo',sans-serif;font-size:1rem;font-weight:700;
          background:rgba(84,22,181,.15);color:#c8b8f0;transition:all .25s;}
        .pd-cart:hover{background:rgba(84,22,181,.3);color:#fff;transform:translateY(-2px);}
        .pd-cart.added{background:rgba(46,204,113,.18);border-color:rgba(46,204,113,.5);color:#7ef0a8;}
        .pd-icon-btn{width:52px;flex-shrink:0;border-radius:14px;border:1px solid rgba(84,22,181,.35);
          background:rgba(84,22,181,.12);color:#c4a0e0;font-size:1.1rem;cursor:pointer;transition:all .25s;
          display:flex;align-items:center;justify-content:center;position:relative;}
        .pd-icon-btn:hover{background:rgba(84,22,181,.28);color:#fff;transform:translateY(-2px);}
        .pd-icon-btn.on{color:#ff5c8a;border-color:rgba(255,92,138,.45);background:rgba(255,92,138,.12);}
        .pd-toast{position:absolute;bottom:-30px;right:50%;transform:translateX(50%);white-space:nowrap;
          font-size:.7rem;background:rgba(12,5,22,.95);border:1px solid rgba(84,22,181,.4);color:#c8b8f0;
          padding:.25rem .6rem;border-radius:6px;}

        .pd-pay{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:.9rem 0 1.3rem;
          margin-bottom:1.2rem;border-bottom:1px solid rgba(84,22,181,.14);}
        .pd-pay-label{display:inline-flex;align-items:center;gap:7px;font-size:.78rem;color:rgba(180,168,215,.55);font-weight:700;}
        .pd-pay-label i{color:#7ef0a8;font-size:.72rem;}
        .pd-pay-icons{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
        .pd-pay-icons i{font-size:1.7rem;color:rgba(210,204,232,.75);transition:color .2s;}
        .pd-pay-icons i:hover{color:#fff;}
        .pd-pay-txt{font-family:'Oxanium',sans-serif;font-size:.72rem;font-weight:800;letter-spacing:.5px;
          padding:.2rem .5rem;border-radius:5px;background:rgba(84,22,181,.2);color:#c8b8f0;border:1px solid rgba(155,89,208,.3);}

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
              <button className="pd-buynow" onClick={buyNow}>
                <i className="fas fa-bolt" /> اشتري الآن
              </button>
              <button className={`pd-cart${added ? ' added' : ''}`} onClick={addToCart}>
                {added ? <>✓ تمت الإضافة</> : <><i className="fas fa-cart-plus" /> أضف للسلة</>}
              </button>
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

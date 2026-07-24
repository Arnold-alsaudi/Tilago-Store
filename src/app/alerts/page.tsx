'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';

/* ─── Types ─── */
interface AlertItem {
  id: string; name: string; rating: string; ratingCount: number;
  price: string; desc: string; category: string;
  imgs?: string[]; video?: string;
}

/* ─── Data ─── */
const CATEGORIES = [
  { id: 'diamond',  title: 'الاليرتات الخاصة',    desc: 'اليرت خاص تقدر تحط أسهمك أو شعارك',        img: '/photo/alert-special.png' },
  { id: 'golden',   title: 'الاليرتات جيفت',    desc: 'إيرتات جيفت متنوعة ومميزة',                 img: '/photo/alert-gift.png'    },
  { id: 'platinum', title: 'الاليرتات التكبيس', desc: 'اليرت تكبيس للفولو والريد',                 img: '/photo/alert-follow.png'  },
  { id: 'anime',    title: 'الأليرتات الأنمي',     desc: 'مخصصة لعشاق الأنمي',                        img: '/photo/anime.png'         },
  { id: 'snow',     title: 'الاليرتات الدعم',    desc: 'افضل لعشاق الأنمي والثلج',                  img: '/caf.png'                 },
  { id: 'fire',     title: 'الأليرتات ثري دي',     desc: 'اليرتات ثري دي بتصميم مبهر',               img: '/photo/alert-3d.png'      },
];

interface DbProduct {
  id: string; slug: string | null; title: string; description: string;
  price: number; priceLabel: string | null; subCategory: string | null;
  imageUrl: string; images: string[]; videoUrl: string | null;
  rating: number; ratingCount: number; tags: string[];
}

const toAlertItem = (p: DbProduct): AlertItem => ({
  id: p.slug ?? p.id,
  name: p.title,
  rating: String(p.rating),
  ratingCount: p.ratingCount,
  price: p.priceLabel ?? `${p.price} $`,
  desc: p.description,
  category: p.tags?.[0] ?? '',
  imgs: p.images?.length ? p.images : [p.imageUrl],
  video: p.videoUrl ?? undefined,
});

const CONTACT_BTNS = [
  { icon: 'fab fa-whatsapp', label: 'طلب الآن',     href: 'https://wa.me/1234567890', color: '#25D366' },
  { icon: 'fab fa-telegram', label: 'تيليجرام',     href: 'https://t.me/yourchannel', color: '#0088cc' },
  { icon: 'fab fa-discord',  label: 'ديسكورد',      href: 'https://discord.gg/yourserver', color: '#5865F2' },
  { icon: 'fas fa-headset',  label: 'خدمة العملاء', href: 'mailto:support@tilago.com', color: '#5416B5' },
];

/* ─── Component ─── */
export default function AlertsPage() {
  const [activeCat, setActiveCat]   = useState<string | null>(null);
  const [modal, setModal]           = useState<AlertItem | null>(null);
  const [mediaTab, setMediaTab]     = useState<'image' | 'video'>('image');
  const [slide, setSlide]           = useState(0);
  const [payLoading, setPayLoading] = useState<'paypal' | 'meeza' | null>(null);
  const [delivered, setDelivered]   = useState(false);
  const [alertsData, setAlertsData] = useState<Record<string, AlertItem[]>>({});
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [storePaused, setStorePaused] = useState(false);
  const [pauseMessage, setPauseMessage] = useState('');
  const { addItem } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);
  const [phone, setPhone] = useState('');

  const priceValue = (price: string) => Number(price.replace(/[^\d.]/g, '')) || 0;

  const validPhone = () => {
    if (phone.replace(/\D/g, '').length < 8) {
      alert('من فضلك اكتب رقم موبايلك الصحيح للتواصل معك وتسليم المنتج');
      return false;
    }
    return true;
  };

  const addAlertToCart = (item: AlertItem) => {
    addItem({
      id: item.id,
      title: item.name,
      description: item.desc,
      price: priceValue(item.price),
      category: 'ALERTS',
      imageUrl: item.imgs?.[0] ?? '',
      videoUrl: item.video ?? null,
      tags: [item.category],
      featured: false,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // جلب المنتجات من قاعدة البيانات
  useEffect(() => {
    fetch('/api/products?category=ALERTS')
      .then(r => r.json())
      .then((products: DbProduct[]) => {
        const grouped: Record<string, AlertItem[]> = {};
        for (const p of products) {
          const key = p.subCategory ?? 'other';
          (grouped[key] ??= []).push(toAlertItem(p));
        }
        setAlertsData(grouped);
      })
      .catch(() => {})
      .finally(() => setLoadingProducts(false));

    // التحقق من حالة الشراء
    fetch('/api/settings')
      .then(r => r.json())
      .then(s => { setStorePaused(!!s.storePaused); setPauseMessage(s.pauseMessage ?? ''); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (loadingProducts) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') !== 'success') return;
    const alertId = params.get('alertId');
    const purchased = Object.values(alertsData).flat().find(a => a.id === alertId);
    if (purchased) {
      setModal(purchased);
      setDelivered(true);
      // الـ webhook من Paymob هو المصدر الحقيقي لتسجيل الدفع
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingProducts, alertsData]);

  const payWithPaypal = (item: AlertItem) => {
    if (!validPhone()) return;
    // سجّل الطلب مع رقم العميل عشان يوصل الأدمن، ثم حوّل لرابط PayPal.me
    fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: item.name, amount: priceValue(item.price), phone: phone.trim(), method: 'PayPal' }),
    }).catch(() => {});
    const handle = process.env.NEXT_PUBLIC_PAYPAL_ME || 'tiger098';
    window.location.href = `https://www.paypal.me/${handle}/${priceValue(item.price)}`;
  };

  const payWithMeeza = async (item: AlertItem) => {
    if (!validPhone()) return;
    setPayLoading('meeza');
    try {
      const res = await fetch('/api/alerts/paymob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: item.name, amount: priceValue(item.price), alertId: item.id, phone: phone.trim() }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert('تعذر بدء عملية الدفع، حاول مرة أخرى');
    } catch {
      alert('تعذر بدء عملية الدفع، حاول مرة أخرى');
    } finally {
      setPayLoading(null);
    }
  };

  const catData  = activeCat ? CATEGORIES.find(c => c.id === activeCat) : null;
  const alerts   = activeCat ? alertsData[activeCat] ?? [] : [];
  const total    = CATEGORIES.length;

  useEffect(() => {
    if (activeCat) return;
    const t = setInterval(() => setSlide(s => (s + 1) % total), 4000);
    return () => clearInterval(t);
  }, [activeCat, total]);

  const moveCarousel = (dir: number) => setSlide(s => (s + dir + total) % total);

  const openModal = (alert: AlertItem) => {
    setModal(alert);
    setMediaTab('image');
    setDelivered(false);
  };

  const closeModal = () => {
    setModal(null);
    setDelivered(false);
  };

  return (
    <>
      <style>{`
        /* ── Base ── */
        .al-page { font-family:'29LtBukra','Montserrat',sans-serif; color:#d0cce8; overflow-x:hidden; }

        /* ── Hero ── */
        .al-hero {
          display:flex; flex-wrap:wrap; align-items:center;
          justify-content:space-around; padding:4rem 5%; gap:2rem;
        }
        .al-hero-video {
          flex:1; min-width:300px; max-width:500px;
          border:1px solid rgba(84,22,181,0.35); border-radius:16px; overflow:hidden;
          box-shadow:0 4px 24px rgba(0,0,0,0.5);
        }
        .al-hero-video video { width:100%; height:auto; display:block; }
        .al-hero-content { flex:1; min-width:300px; max-width:500px; padding:1rem; }
        .al-hero-content h2 {
          font-family:'Oxanium',sans-serif; font-size:2.2rem; color:#e8e4f8;
          margin-bottom:1rem;
        }
        .al-hero-content p { color:#a09abf; font-size:1rem; margin-bottom:2rem; line-height:1.7; }
        .al-cta {
          display:inline-block; padding:.9rem 2.2rem;
          background:linear-gradient(135deg,#5416B5,#7F3AA1);
          color:#fff; font-weight:600; font-size:1rem;
          border:none; border-radius:50px; cursor:pointer;
          box-shadow:0 4px 16px rgba(84,22,181,0.35);
          transition:all .3s; text-transform:uppercase; letter-spacing:1px;
          text-decoration:none;
        }
        .al-cta:hover { transform:translateY(-2px); box-shadow:0 6px 22px rgba(84,22,181,0.45); }
        @media(max-width:768px) {
          .al-hero { flex-direction:column; text-align:center; }
        }

        /* ── Carousel ── */
        .al-carousel-section {
          padding:4rem 0; position:relative; overflow:hidden;
          background:linear-gradient(180deg,#0F083B,#0C0516);
        }
        .al-carousel-title {
          font-family:'Oxanium',sans-serif; font-size:1.4rem;
          color:#d0cce8; text-align:center; margin-bottom:1.5rem;
        }
        .al-carousel-wrap {
          max-width:1200px; margin:0 auto; padding:0 2rem;
          position:relative; min-height:320px; overflow:hidden;
          border-radius:20px; background:rgba(15,8,59,0.5);
          backdrop-filter:blur(12px);
          border:1px solid rgba(84,22,181,0.3);
          box-shadow:0 8px 32px rgba(0,0,0,0.4);
        }
        /* ── Stats Bar ── */
        .al-stats {
          display:flex; justify-content:center; flex-wrap:wrap; gap:0;
          background:rgba(15,8,59,0.6); border-top:1px solid rgba(84,22,181,0.18);
          border-bottom:1px solid rgba(84,22,181,0.18);
        }
        .al-stat-item {
          flex:1; min-width:160px; padding:1.8rem 1rem;
          text-align:center; border-left:1px solid rgba(84,22,181,0.15);
        }
        .al-stat-item:last-child { border-left:none; }
        .al-stat-num {
          font-family:'Oxanium',sans-serif; font-size:1.8rem; font-weight:800;
          color:#9B59D0; display:block; margin-bottom:.3rem;
        }
        .al-stat-label { color:rgba(170,155,200,0.65); font-size:.8rem; letter-spacing:1px; }

        /* ── Features ── */
        .al-features {
          padding:4rem 5%; display:grid;
          grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1.2rem;
          background:linear-gradient(180deg,#0C0516,#0F083B);
        }
        .al-feature-card {
          background:rgba(15,8,59,0.5); border-radius:14px; padding:1.8rem 1.4rem;
          border:1px solid rgba(84,22,181,0.15); text-align:right;
          transition:border-color .3s, transform .3s;
        }
        .al-feature-card:hover { border-color:rgba(127,58,161,0.5); transform:translateY(-4px); }
        .al-feature-icon {
          width:44px; height:44px; border-radius:12px; margin-bottom:1rem;
          background:rgba(84,22,181,0.2); border:1px solid rgba(127,58,161,0.3);
          display:flex; align-items:center; justify-content:center;
          color:#9B59D0; font-size:1.1rem;
        }
        .al-feature-title { font-weight:700; color:#e8e4f8; margin-bottom:.5rem; font-size:1rem; }
        .al-feature-desc { color:rgba(160,150,190,0.65); font-size:.82rem; line-height:1.6; }

        /* ── Products Grid ── */
        .al-products {
          padding:4rem 5%; display:grid;
          grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:1.5rem; text-align:center;
        }
        .al-product-card {
          background:rgba(15,8,59,0.5); border-radius:14px; overflow:hidden;
          box-shadow:0 4px 16px rgba(0,0,0,0.3); transition:all .3s ease;
          border:1px solid rgba(84,22,181,0.2); cursor:pointer;
        }
        .al-product-card:hover {
          transform:translateY(-6px);
          box-shadow:0 8px 24px rgba(84,22,181,0.25);
          border-color:rgba(84,22,181,0.5);
        }
        .al-product-img { width:100%; height:180px; object-fit:cover; }
        .al-product-title {
          padding:.5rem 1.2rem; font-size:1.1rem; font-weight:600; color:#e8e4f8; margin:.6rem auto .4rem;
          display:inline-block;
          background:rgba(84,22,181,0.25); border:1px solid rgba(127,58,161,0.4);
          border-radius:10px; backdrop-filter:blur(6px);
          box-shadow:0 0 16px rgba(84,22,181,0.18);
        }
        .al-product-desc  { padding:0 1rem; color:#9090b0; font-size:.85rem; margin-bottom:1rem; }

        /* ── Category Page ── */
        .al-cat-header {
          display:flex; justify-content:space-between; align-items:center;
          margin-bottom:2rem; flex-wrap:wrap; gap:1rem; padding:1rem 5% 0;
        }
        .al-back-btn {
          background:rgba(84,22,181,0.25); color:#c4a0e0; padding:.5rem 1.2rem;
          border-radius:50px; text-decoration:none; font-weight:600;
          transition:.3s; display:flex; align-items:center; gap:8px;
          border:1px solid rgba(84,22,181,0.4); cursor:pointer;
        }
        .al-back-btn:hover { background:rgba(84,22,181,0.45); color:#fff; }
        .al-cat-title {
          font-family:'Oxanium',sans-serif; color:#e8e4f8; font-size:1.4rem;
          background:rgba(84,22,181,0.22); border:1px solid rgba(127,58,161,0.35);
          padding:.45rem 1.4rem; border-radius:12px;
          backdrop-filter:blur(6px); box-shadow:0 0 18px rgba(84,22,181,0.2);
        }
        .al-cat-grid {
          display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
          gap:1.5rem; text-align:center; padding:0 5%; margin-top:1rem;
        }
        @media(min-width:769px) { .al-cat-grid { grid-template-columns:repeat(3,1fr); } }

        /* ── Alert Card ── */
        .al-small-card {
          background:rgba(15,8,59,0.55); border-radius:14px; overflow:hidden;
          box-shadow:0 4px 14px rgba(0,0,0,0.3); border:1px solid rgba(84,22,181,0.2);
          transition:all .35s ease; cursor:pointer;
          display:flex; flex-direction:column; align-items:center; text-align:center;
        }
        .al-small-card:hover {
          transform:translateY(-6px);
          box-shadow:0 8px 22px rgba(84,22,181,0.2);
          border-color:rgba(84,22,181,0.5);
        }
        .al-card-header {
          position:relative; width:100%; height:180px; overflow:hidden;
          display:flex; align-items:center; justify-content:center;
          background:rgba(12,5,22,0.4);
        }
        .al-card-header img {
          width:100%; height:100%; object-fit:cover; border-radius:0;
        }
        .al-card-overlay {
          position:absolute; top:0; left:0; width:100%; height:100%;
          background:linear-gradient(180deg,rgba(84,22,181,0.1),rgba(84,22,181,0.5));
          opacity:0; transition:opacity .3s ease; z-index:1;
        }
        .al-small-card:hover .al-card-overlay { opacity:1; }
        .al-card-content {
          padding:1rem; color:#d0cce8; text-align:center;
          background:rgba(12,5,22,0.7); z-index:2; width:100%;
        }
        .al-card-name { font-size:1rem; font-weight:600; margin-bottom:.5rem; color:#e8e4f8; }
        .al-card-meta { display:flex; justify-content:space-between; font-size:.8rem; margin-bottom:.5rem; }
        .al-rating    { color:#c4a0e0; font-weight:600; }
        .al-price     { color:#9d7fd4; }
        .al-card-desc { color:#9090b0; font-size:.85rem; margin-bottom:1rem; }
        .al-btn-preview {
          padding:.45rem 1.1rem; border:1px solid rgba(84,22,181,0.5); border-radius:8px;
          font-size:.85rem; cursor:pointer; font-weight:600;
          background:rgba(84,22,181,0.25); color:#c4a0e0; transition:all .3s;
        }
        .al-btn-preview:hover { background:rgba(84,22,181,0.5); color:#fff; }

        /* ── Contact Buttons ── */
        .al-contact-btns {
          display:grid; grid-template-columns:repeat(2,1fr);
          gap:.6rem; margin-top:2rem; padding-bottom:2rem;
        }
        .al-contact-btn {
          display:flex; align-items:center; gap:10px;
          padding:.9rem 1.2rem; border-radius:14px;
          font-weight:600; font-size:.88rem; color:#d0cce8;
          text-decoration:none; transition:all .3s ease;
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.07);
          backdrop-filter:blur(6px);
        }
        .al-contact-btn-icon {
          width:36px; height:36px; border-radius:10px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center; font-size:1.1rem;
        }
        .al-contact-btn-text { display:flex; flex-direction:column; gap:1px; }
        .al-contact-btn-title { font-size:.82rem; font-weight:700; color:#e8e4f8; }
        .al-contact-btn-sub   { font-size:.68rem; color:rgba(180,170,210,0.5); font-weight:400; }
        .al-contact-btn:hover {
          background:rgba(255,255,255,0.06);
          border-color:rgba(255,255,255,0.14);
          transform:translateY(-2px);
          box-shadow:0 6px 20px rgba(0,0,0,0.2);
        }
        .al-modal-box .al-contact-btns {
          margin-top:1.2rem; padding-bottom:0;
          grid-template-columns:repeat(2,1fr);
        }

        /* ── Payment Buttons ── */
        .al-pay-section {
          margin-top:1.4rem; border-top:1px solid rgba(84,22,181,0.15); padding-top:1.2rem;
        }
        .al-pay-label {
          font-size:.7rem; color:rgba(160,150,190,0.45); letter-spacing:2px;
          text-transform:uppercase; margin-bottom:1rem; text-align:right;
        }
        .al-pay-btns { display:flex; gap:.6rem; flex-wrap:wrap; }
        .al-pay-btn {
          display:flex; align-items:center; justify-content:center; gap:7px;
          padding:.6rem 1.1rem; border-radius:12px; font-weight:600; font-size:.82rem;
          border:1px solid transparent; cursor:pointer; transition:all .28s;
          text-decoration:none; white-space:nowrap; flex:1; min-width:0;
        }
        .al-pay-btn-paypal {
          background:linear-gradient(135deg,#003087,#009cde);
          color:#fff; border-color:rgba(0,156,222,0.3);
          box-shadow:0 2px 10px rgba(0,100,200,0.2);
        }
        .al-pay-btn-paypal:hover { transform:translateY(-2px); box-shadow:0 5px 16px rgba(0,100,200,0.35); }
        .al-pay-btn-card {
          background:rgba(20,14,50,0.9); color:#d0cce8;
          border:1px solid rgba(84,22,181,0.3);
        }
        .al-pay-btn-card:hover { border-color:rgba(127,58,161,0.7); color:#fff; transform:translateY(-2px); background:rgba(84,22,181,0.18); }
        .al-pay-btn-card .pay-card-icons { display:flex; gap:3px; align-items:center; }
        .al-pay-btn-card .pay-card-icons span {
          font-size:.6rem; padding:2px 5px; border-radius:4px; font-weight:800; letter-spacing:.5px;
        }
        .meeza-tag { background:linear-gradient(90deg,#6a1b9a,#8e24aa); color:#fff; }
        .al-pay-btn-stc {
          background:linear-gradient(135deg,#4b0f8c,#7F3AA1);
          color:#fff; border-color:rgba(127,58,161,0.35);
          box-shadow:0 2px 10px rgba(84,22,181,0.2);
        }
        .al-pay-btn-stc:hover { transform:translateY(-2px); box-shadow:0 5px 16px rgba(84,22,181,0.4); }
        .al-pay-btn i { font-size:.95rem; }

        /* ── Modal ── */
        .al-modal-backdrop {
          position:fixed; top:0; left:0; width:100%; height:100%;
          background:rgba(0,0,0,0.8); z-index:2000;
          display:flex; flex-direction:column; justify-content:flex-start; align-items:center;
          backdrop-filter:blur(6px); overflow-y:auto; padding:1.5rem 1rem 3rem;
        }
        .al-modal-video-wrap {
          width:100%; max-width:800px; border-radius:16px; overflow:hidden;
          border:1px solid rgba(84,22,181,0.25);
          box-shadow:0 8px 40px rgba(0,0,0,0.6);
          margin-bottom:1.2rem; flex-shrink:0;
        }
        .al-modal-video-wrap video {
          width:100%; display:block; max-height:400px; object-fit:cover; background:#000;
        }
        .al-modal-box {
          background:rgba(12,5,22,0.97); border-radius:16px; padding:2rem;
          max-width:1100px; width:90%; max-height:90vh;
          box-shadow:0 8px 40px rgba(0,0,0,0.6); overflow-y:auto;
          border:1px solid rgba(84,22,181,0.25);
          position:relative; animation:modalPop .35s ease;
        }
        @keyframes modalPop { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
        .al-modal-close {
          position:absolute; top:1rem; left:1rem;
          background:rgba(84,22,181,0.3); color:#c4a0e0;
          width:36px; height:36px; border-radius:50%; border:1px solid rgba(84,22,181,0.4);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; font-size:1.3rem; transition:.3s; z-index:10;
        }
        .al-modal-close:hover { background:rgba(84,22,181,0.55); color:#fff; }
        .al-modal-head { text-align:center; margin-bottom:2rem; }
        .al-modal-head h2 {
          font-family:'Oxanium',sans-serif; font-size:1.8rem;
          color:#e8e4f8; margin-bottom:.5rem;
        }
        .al-modal-head p { color:#9090b0; }
        .al-modal-body { display:flex; flex-wrap:wrap; flex-direction:row-reverse; gap:2rem; }
        .al-modal-left { flex:1; min-width:280px; }
        .al-modal-right { flex:1; min-width:280px; text-align:center; margin-top:-2rem; }
        .al-info-box { background:rgba(15,8,59,0.6); border-radius:12px; padding:1.5rem; border:1px solid rgba(84,22,181,0.2); }
        .al-info-box h3 { color:#e8e4f8; margin-bottom:1rem; }
        .al-info-box p, .al-info-box li { color:#9090b0; margin-bottom:.5rem; }
        .al-info-box strong { color:#c4a0e0; }
        .al-info-box ul { list-style:none; }
        .al-highlight { color:#9d7fd4; font-weight:600; }
        .al-toggle-row { display:flex; gap:.7rem; justify-content:center; margin-bottom:1rem; }
        .al-toggle-btn {
          padding:.55rem 1.1rem; background:rgba(84,22,181,0.15);
          border:1px solid rgba(84,22,181,0.35); border-radius:50px; color:#c4a0e0;
          font-weight:600; cursor:pointer; transition:all .3s;
          display:flex; align-items:center; gap:8px;
        }
        .al-toggle-btn:hover { background:rgba(84,22,181,0.3); color:#fff; }
        .al-toggle-btn.active { background:rgba(84,22,181,0.5); border-color:rgba(84,22,181,0.7); color:#fff; }
        .al-media-box {
          width:100%; height:380px; border-radius:12px; overflow:hidden;
          border:1px solid rgba(84,22,181,0.3); box-shadow:0 4px 20px rgba(0,0,0,0.4);
        }
        .al-media-box img  { width:100%; height:100%; object-fit:contain; display:block; }
        .al-media-box video{ width:100%; height:100%; object-fit:contain; display:block; background:#000; }

        /* ── Media Toggle ── */
        .al-media-toggle { display:flex; gap:.6rem; justify-content:center; margin-bottom:.8rem; }
        .al-toggle-btn { display:inline-flex; align-items:center; gap:6px; padding:.45rem 1.4rem; border-radius:50px; border:2px solid #7F3AA1; background:transparent; color:#fff; font-family:'29LtBukra','Montserrat',sans-serif; font-size:.88rem; font-weight:700; cursor:pointer; transition:all .22s; }
        .al-toggle-btn.active { background:linear-gradient(135deg,#5416B5,#7F3AA1); border-color:transparent; box-shadow:0 3px 14px rgba(84,22,181,0.45); }
        .al-toggle-btn:hover:not(.active) { background:rgba(84,22,181,0.15); }

        /* ── Media Preview ── */
        .al-media-preview { display:flex; flex-direction:column; gap:.9rem; }
        .al-media-imgs { display:flex; gap:.8rem; }
        .al-media-img-wrap { flex:1; position:relative; border-radius:12px; overflow:hidden; border:1px solid rgba(84,22,181,0.25); box-shadow:0 4px 16px rgba(0,0,0,0.4); }
        .al-media-img-wrap img { width:100%; height:180px; object-fit:cover; display:block; }
        .al-media-img-label { position:absolute; bottom:8px; right:50%; transform:translateX(50%); background:rgba(0,0,0,0.65); backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.1); border-radius:50px; padding:.2rem .75rem; font-size:.75rem; color:rgba(255,255,255,0.8); white-space:nowrap; font-family:'29LtBukra','Montserrat',sans-serif; }
        .al-video-btn { display:flex; align-items:center; gap:.9rem; width:100%; padding:.85rem 1.2rem; background:rgba(84,22,181,0.12); border:1px solid rgba(84,22,181,0.3); border-radius:12px; color:#fff; font-family:'29LtBukra','Montserrat',sans-serif; font-size:.95rem; font-weight:700; cursor:pointer; transition:all .22s; }
        .al-video-btn:hover { background:rgba(84,22,181,0.25); border-color:#7F3AA1; transform:translateY(-1px); }
        .al-video-btn-icon { width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg,#5416B5,#7F3AA1); display:flex; align-items:center; justify-content:center; font-size:.9rem; flex-shrink:0; box-shadow:0 3px 12px rgba(84,22,181,0.4); }
        .al-video-player { display:flex; flex-direction:column; gap:.6rem; }
        .al-video-close-btn { display:flex; align-items:center; gap:6px; background:rgba(84,22,181,0.15); border:1px solid rgba(84,22,181,0.25); color:rgba(255,255,255,0.7); border-radius:8px; padding:.4rem .9rem; font-family:'29LtBukra','Montserrat',sans-serif; font-size:.82rem; cursor:pointer; width:fit-content; transition:all .2s; }
        .al-video-close-btn:hover { background:rgba(84,22,181,0.3); color:#fff; }

        /* ── Footer ── */
        .al-footer {
          margin-top:5rem; padding:3rem 5% 2rem;
          background:rgba(12,5,22,0.85); border-top:1px solid rgba(84,22,181,0.2); text-align:center;
        }
        .al-footer-content {
          display:flex; flex-wrap:wrap; justify-content:space-between;
          gap:2rem; margin-bottom:2rem; text-align:right;
        }
        .al-footer-col h4 { color:#e8e4f8; margin-bottom:1rem; font-family:'Oxanium',sans-serif; }
        .al-footer-col ul { list-style:none; }
        .al-footer-col li { margin:.5rem 0; }
        .al-footer-col a { color:#9090b0; text-decoration:none; transition:.3s; }
        .al-footer-col a:hover { color:#c4a0e0; }
        .al-social { display:flex; gap:1.2rem; justify-content:center; flex-wrap:wrap; }
        .al-social a {
          display:inline-flex; align-items:center; justify-content:center;
          width:42px; height:42px; background:rgba(122,0,255,0.2);
          border-radius:50%; color:#5416B5; font-size:1.3rem; transition:all .3s;
        }
        .al-social a:hover { background:#5416B5; color:#fff; box-shadow:0 0 18px rgba(122,0,255,0.6); }
        .al-copyright { color:#888; font-size:.9rem; margin-top:2rem; }

        /* ── RESPONSIVE ── */

        /* Tablet */
        @media(max-width:1024px){
          .al-hero { padding:3rem 4%; }
          .al-products { grid-template-columns:repeat(2,1fr); padding:3rem 4%; }
          .al-cat-grid { grid-template-columns:repeat(2,1fr) !important; }
          .al-modal-box { padding:1.5rem; width:95%; }
          .al-modal-head h2 { font-size:1.4rem; }
        }

        /* Mobile landscape + large phones */
        @media(max-width:768px){
          .al-hero { flex-direction:column; text-align:center; padding:2rem 5%; gap:1.5rem; }
          .al-hero-video { min-width:unset; max-width:100%; }
          .al-hero-content { min-width:unset; max-width:100%; padding:.5rem; }
          .al-hero-content h2 { font-size:1.6rem; }
          .al-hero-content p { font-size:.9rem; margin-bottom:1.5rem; }
          .al-stats { flex-wrap:wrap; }
          .al-stat-item { min-width:50%; border-left:none; border-bottom:1px solid rgba(84,22,181,0.1); padding:1.2rem .5rem; }
          .al-stat-num { font-size:1.5rem; }
          .al-products { grid-template-columns:repeat(2,1fr); padding:2rem 4%; gap:1rem; }
          .al-features { padding:2.5rem 4%; gap:1rem; }
          .al-cat-header { padding:.8rem 4% 0; }
          .al-cat-grid { grid-template-columns:repeat(2,1fr) !important; padding:0 4%; gap:1rem; }
          .al-modal-body { flex-direction:column; }
          .al-modal-right { margin-top:0; }
          .al-media-box { height:260px; }
          .al-modal-box .al-contact-btns { grid-template-columns:1fr; }
          .al-contact-btns { grid-template-columns:1fr; }
          .al-pay-btns { flex-direction:column; }
          .al-pay-btn { flex:none; }
          .al-modal-video-wrap video { max-height:260px; }
        }

        /* Small mobile */
        @media(max-width:480px){
          .al-hero-content h2 { font-size:1.3rem; }
          .al-products { grid-template-columns:1fr; padding:1.5rem 4%; }
          .al-product-img { height:150px; }
          .al-cat-grid { grid-template-columns:1fr !important; }
          .al-features { grid-template-columns:1fr; }
          .al-stat-item { min-width:100%; }
          .al-modal-box { padding:1.2rem; border-radius:12px; }
          .al-modal-head h2 { font-size:1.2rem; }
          .al-modal-video-wrap { border-radius:10px; }
          .al-modal-video-wrap video { max-height:200px; }
          .al-media-box { height:200px; }
          .al-contact-btn { padding:.75rem 1rem; font-size:.82rem; }
          .al-modal-backdrop { padding:1rem .5rem 2rem; }
        }

        /* Touch devices */
        @media(hover:none){
          .al-product-card:hover,.al-small-card:hover,.al-feature-card:hover { transform:none; box-shadow:none; }
          .al-product-card:active { border-color:rgba(84,22,181,0.5); }
          .al-small-card:active { border-color:rgba(84,22,181,0.5); }
        }
      `}</style>

      <div className="al-page" dir="rtl">

        {/* ── Hero ── */}
        {!activeCat && (
          <section className="al-hero">
            <div className="al-hero-video">
              <video autoPlay muted loop playsInline>
                <source src="https://res.cloudinary.com/v6vo90hw/video/upload/v1784782938/tilago/alert.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="al-hero-content">
              <h2>أفضل Alerts احترافية من Tilago</h2>
              <p>اليرتات جاهزة ومصممة باحترافية لقنوات البث المباشر، تزيد من تفاعل المشاهدين وتجعل شكل قناتك أكثر احترافية.</p>
              <a href="#products" className="al-cta">تصفح الآن</a>
            </div>
          </section>
        )}

        {/* ── Stats Bar ── */}
        {!activeCat && (
          <div className="al-stats">
            {[
              { num: '+50',  label: 'تصميم جاهز' },
              { num: '6',    label: 'فئة متنوعة' },
              { num: '24h',  label: 'وقت التسليم' },
              { num: '100%', label: 'مخصص لك' },
            ].map(s => (
              <div key={s.label} className="al-stat-item">
                <span className="al-stat-num">{s.num}</span>
                <span className="al-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Products Grid ── */}
        {!activeCat && (
          <section id="products" className="al-products">
            {CATEGORIES.map(cat => (
              <div key={cat.id} className="al-product-card" onClick={() => setActiveCat(cat.id)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cat.img} alt={cat.title} className="al-product-img" />
                <div className="al-product-title">{cat.title}</div>
                <div className="al-product-desc">({cat.desc})</div>
              </div>
            ))}
          </section>
        )}

        {/* ── Features ── */}
        {!activeCat && (
          <section className="al-features">
            {[
              { icon:'fas fa-paint-brush', title:'تصميم احترافي', desc:'كل أليرت مصمم بعناية من قبل مصممين متخصصين في عالم البث المباشر.' },
              { icon:'fas fa-bolt',        title:'تسليم سريع',    desc:'تستلم الأليرت جاهز للاستخدام خلال ساعة إلى 24 ساعة فقط.' },
              { icon:'fas fa-sliders-h',   title:'قابل للتخصيص', desc:'أضف شعارك واسمك وألوانك المفضلة على أي تصميم.' },
              { icon:'fas fa-headset',     title:'دعم مستمر',    desc:'فريقنا متاح دائماً للمساعدة في التركيب والإعداد على OBS وStreamlabs.' },
            ].map(f => (
              <div key={f.title} className="al-feature-card">
                <div className="al-feature-icon"><i className={f.icon} /></div>
                <div className="al-feature-title">{f.title}</div>
                <div className="al-feature-desc">{f.desc}</div>
              </div>
            ))}
          </section>
        )}

        {/* ── Category Page ── */}
        {activeCat && catData && (
          <section>
            <div className="al-cat-header">
              <button className="al-back-btn" onClick={() => setActiveCat(null)}>
                <i className="fas fa-arrow-right" /> العودة
              </button>
              <h2 className="al-cat-title">{catData.title}</h2>
            </div>

            <div className="al-cat-grid">
              {alerts.map(alert => (
                <div key={alert.id} className="al-small-card">
                  <div className="al-card-header">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={alert.imgs?.[0] ?? '/caf.png'} alt={alert.name} />
                    <div className="al-card-overlay" />
                  </div>
                  <div className="al-card-content">
                    <h3 className="al-card-name">{alert.name}</h3>
                    <div className="al-card-meta">
                      <span className="al-rating">★ {alert.rating} ({alert.ratingCount})</span>
                      <span className="al-price">{alert.price}</span>
                    </div>
                    <p className="al-card-desc">{alert.desc}</p>
                    <button className="al-btn-preview" onClick={() => openModal(alert)}>عرض سريع</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="al-contact-btns" style={{ maxWidth:'480px', margin:'2rem auto' }}>
              {CONTACT_BTNS.map(btn => (
                <a key={btn.label} href={btn.href} target="_blank" rel="noreferrer" className="al-contact-btn">
                  <div className="al-contact-btn-icon" style={{ background: `${btn.color}18`, color: btn.color }}>
                    <i className={btn.icon} />
                  </div>
                  <div className="al-contact-btn-text">
                    <span className="al-contact-btn-title">{btn.label}</span>
                    <span className="al-contact-btn-sub">تواصل معنا</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── Modal ── */}
        {modal && (
          <div className="al-modal-backdrop" onClick={closeModal}>

            <div className="al-modal-box" onClick={e => e.stopPropagation()}>
              <button className="al-modal-close" onClick={closeModal}>×</button>

              <div className="al-modal-head">
                <h2>{modal.name}</h2>
                <p>{modal.desc}</p>
              </div>

              <div className="al-modal-body">
                {/* Info */}
                <div className="al-modal-left">
                  <div className="al-info-box">
                    <p><strong>التصنيف:</strong> <span className="al-highlight">{modal.category}</span></p>
                    <p><strong>تقييم:</strong> {'★'.repeat(Math.floor(Number(modal.rating)))} ({modal.ratingCount})</p>
                    <p><strong>السعر:</strong> <span className="al-highlight">{modal.price} $</span></p>
                    <ul style={{ margin: '8px 0', paddingRight: '1.2rem', fontSize: '.88rem', color: '#c0b0e0' }}>
                      <li>إضافة الشعار الخاص بك أو اسمك</li>
                      <li>التسليم: من ساعة إلى 24 ساعة</li>
                      <li>✅ متوافق مع OBS Studio و Streamlabs</li>
                      <li>✅ جودة عالية — يدعم الخلفية الشفافة (WebM)</li>
                    </ul>
                    <p style={{ color: 'red', fontSize: '.8rem', margin: '4px 0 0' }}>ممنوع إعادة بيع المنتج بعد الشراء.</p>

                    {/* Payment */}
                    {delivered ? (
                      <div className="al-pay-section" style={{ textAlign: 'center' }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #0f2a1a, #1a3d28)',
                          border: '1px solid #2ecc71',
                          borderRadius: '16px',
                          padding: '28px 24px',
                          marginTop: '8px',
                        }}>
                          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
                          <p style={{ color: '#2ecc71', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>
                            تم استلام دفعتك بنجاح
                          </p>
                          <p style={{ color: '#a0c4b0', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '16px' }}>
                            سيتم مراجعة طلبك وتسليم المنتج خلال
                          </p>
                          <div style={{
                            background: '#2ecc71',
                            color: '#000',
                            borderRadius: '12px',
                            padding: '12px 24px',
                            fontSize: '1.4rem',
                            fontWeight: 'bold',
                            display: 'inline-block',
                            marginBottom: '16px',
                          }}>
                            ⏳ 24 ساعة
                          </div>
                          <p style={{ color: '#7aab8a', fontSize: '0.82rem' }}>
                            سيتواصل معك فريق Tilago عبر البريد الإلكتروني أو وسائل التواصل الاجتماعي
                          </p>
                        </div>
                      </div>
                    ) : storePaused ? (
                      <div className="al-pay-section" style={{ textAlign: 'center' }}>
                        <div style={{
                          background: 'rgba(231,76,60,0.08)',
                          border: '1px solid rgba(231,76,60,0.4)',
                          borderRadius: '14px',
                          padding: '22px 18px',
                        }}>
                          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏸️</div>
                          <p style={{ color: '#e74c3c', fontWeight: 'bold', marginBottom: '6px' }}>
                            الطلبات متوقفة مؤقتاً
                          </p>
                          <p style={{ color: '#c09090', fontSize: '.85rem', margin: 0 }}>
                            {pauseMessage || 'نعتذر — الطلبات متوقفة مؤقتاً بسبب الضغط، سنعود قريباً'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="al-pay-section">
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: 'block', color: '#c0a0ff', fontSize: '.85rem', marginBottom: 6, fontWeight: 'bold' }}>
                            📱 رقم موبايلك للتواصل والتسليم
                          </label>
                          <input
                            type="tel"
                            inputMode="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="01xxxxxxxxx"
                            dir="ltr"
                            style={{
                              width: '100%', padding: '12px 14px', borderRadius: 10,
                              border: '1px solid rgba(122,0,255,0.4)', background: 'rgba(0,0,0,0.3)',
                              color: '#F0E6FF', fontSize: '.95rem', textAlign: 'center',
                            }}
                          />
                        </div>
                        <p className="al-pay-label">اختر طريقة الدفع</p>

                        <div className="al-pay-btns">
                          <button
                            className="al-pay-btn al-pay-btn-paypal"
                            disabled={payLoading !== null}
                            onClick={() => payWithPaypal(modal)}
                          >
                            <i className="fab fa-paypal" /> {payLoading === 'paypal' ? 'جارٍ التحويل...' : 'PayPal'}
                          </button>
                          <button
                            className="al-pay-btn al-pay-btn-card"
                            disabled={payLoading !== null}
                            onClick={() => payWithMeeza(modal)}
                          >
                            <div className="pay-card-icons">
                              <span className="meeza-tag">Meeza</span>
                            </div>
                            {payLoading === 'meeza' ? 'جارٍ التحويل...' : 'ميزة'}
                          </button>
                        </div>
                        <button
                          onClick={() => addAlertToCart(modal)}
                          style={{
                            width: '100%',
                            marginTop: '10px',
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid rgba(122,0,255,0.4)',
                            background: addedToCart ? 'rgba(46,204,113,0.15)' : 'rgba(122,0,255,0.1)',
                            color: addedToCart ? '#2ecc71' : '#c0a0ff',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '.95rem',
                          }}
                        >
                          {addedToCart ? '✓ تمت الإضافة للسلة' : '🛒 أضف للسلة'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Media */}
                <div className="al-modal-right">
                  {/* Toggle */}
                  <div className="al-media-toggle">
                    <button className={`al-toggle-btn${mediaTab==='image'?' active':''}`} onClick={()=>setMediaTab('image')}>
                      <i className="fas fa-image"/> صورة
                    </button>
                    <button className={`al-toggle-btn${mediaTab==='video'?' active':''}`} onClick={()=>setMediaTab('video')}>
                      <i className="fas fa-play"/> فيديو
                    </button>
                  </div>

                  {/* Media */}
                  <div className="al-media-box">
                    {mediaTab==='image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={modal.imgs?.[0] ?? '/caf.png'} alt={modal.name} />
                    ) : (
                      <video controls autoPlay id="al-modal-vid">
                        <source src={modal.video ?? 'https://res.cloudinary.com/v6vo90hw/video/upload/v1784782950/tilago/tilago.mp4'} type="video/mp4"/>
                      </video>
                    )}
                  </div>

                  <div className="al-contact-btns" style={{ marginTop: '1.2rem' }}>
                    {CONTACT_BTNS.map(btn => (
                      <a key={btn.label} href={btn.href} target="_blank" rel="noreferrer" className="al-contact-btn">
                        <div className="al-contact-btn-icon" style={{ background: `${btn.color}18`, color: btn.color }}>
                          <i className={btn.icon} />
                        </div>
                        <div className="al-contact-btn-text">
                          <span className="al-contact-btn-title">{btn.label}</span>
                          <span className="al-contact-btn-sub">تواصل معنا</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <footer className="al-footer">
          <div className="al-footer-content">
            <div className="al-footer-col">
              <h4>Tilago</h4>
              <p style={{ color: '#aaa', maxWidth: 300 }}>
                أفضل تنبيهات جاهزة لقنواتك، تصميم مستقبلي، أداء عالي، ودعم احترافي.
              </p>
            </div>
            <div className="al-footer-col">
              <h4>روابط سريعة</h4>
              <ul>
                <li><a href="/">الرئيسية</a></li>
                <li><a href="#products">المنتجات</a></li>
              </ul>
            </div>
            <div className="al-footer-col">
              <h4>تواصل معنا</h4>
              <div className="al-social">
                <a href="#"><i className="fab fa-instagram" /></a>
                <a href="#"><i className="fab fa-tiktok" /></a>
                <a href="#"><i className="fab fa-youtube" /></a>
                <a href="#"><i className="fab fa-twitter" /></a>
              </div>
            </div>
          </div>
          <div className="al-copyright">© 2025 Tilago. جميع الحقوق محفوظة.</div>
        </footer>

      </div>
    </>
  );
}

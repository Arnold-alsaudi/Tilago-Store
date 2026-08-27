'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { PayPalLogo } from '@/components/PayPalLogo';
import { formatPrice } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/types';

// وسيلة التواصل الحقيقية بتتجمّع من التخصيص — بوابات الدفع محتاجة رقم للفوترة فبس.
const BILLING_PHONE = '01000000000';

type PayMethod = 'meeza' | 'paypal';

export default function CartPage() {
  const { items, addItem, removeItem, updateQuantity, total, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [checkingOut, setCheckingOut] = useState<PayMethod | null>(null);

  // ── بوابة التخصيص للمنتجات اللي اتضافت بدون بيانات ──
  const needing = useMemo(() => items.filter(i => !i.customization?.contact), [items]);
  const [showForm, setShowForm] = useState(false);
  const [pendingPay, setPendingPay] = useState<PayMethod | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [custName, setCustName] = useState('');
  const [contact, setContact] = useState('');
  const [formErr, setFormErr] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── منتجات مقترحة "أضفها لسلتك" ──
  const [suggestions, setSuggestions] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/products?category=ALERTS')
      .then(r => r.json())
      .then((list: any[]) => setSuggestions(Array.isArray(list) ? list : []))
      .catch(() => {});
  }, []);

  // حالة إيقاف المتجر — نمنع الدفع ونوضّح للعميل
  const [storePaused, setStorePaused] = useState(false);
  const [pauseMsg, setPauseMsg] = useState('');
  useEffect(() => {
    fetch('/api/settings').then(r => r.json())
      .then(s => { setStorePaused(!!s.storePaused); setPauseMsg(s.pauseMessage || ''); })
      .catch(() => {});
  }, []);
  const cartIds = new Set(items.map(i => i.product.id));
  const recos = suggestions
    .filter(p => !cartIds.has(p.id))
    .slice(0, 8)
    .map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      priceLabel: p.priceLabel ?? null,
      image: p.images?.[0] || p.imageUrl || '',
      category: p.category,
      description: p.description ?? '',
      videoUrl: p.videoUrl ?? null,
      tags: p.tags ?? [],
    }));
  const addReco = (p: (typeof recos)[number]) => {
    addItem({
      id: p.id, title: p.title, description: p.description, price: p.price,
      category: p.category, imageUrl: p.image, videoUrl: p.videoUrl,
      tags: p.tags, featured: false, active: true, createdAt: new Date(), updatedAt: new Date(),
    } as Product);
  };

  const uploadLogo = async (file: File) => {
    setUploading(true); setFormErr('');
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/api/upload/logo', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (data.url) setLogoUrl(data.url as string);
      else setFormErr(data.error ?? 'تعذّر رفع الشعار');
    } catch { setFormErr('تعذّر رفع الشعار، حاول تاني'); }
    finally { setUploading(false); }
  };

  // يبعت بيانات المنتجات اللي كانت ناقصة للأدمن
  const sendNeededCustomization = async () => {
    if (needing.length === 0) return;
    const productName = needing.map(i => `${i.product.title} ×${i.quantity}`).join('، ');
    const qty = Math.min(99, needing.reduce((s, i) => s + i.quantity, 0));
    const amount = needing.reduce((s, i) => s + i.product.price * i.quantity, 0);
    await fetch('/api/product/custom-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productName, quantity: qty, amount, currency: 'EGP', name: custName.trim(), contact: contact.trim(), logoUrl }),
    }).catch(() => {});
  };

  const runPayment = async (method: PayMethod) => {
    if (method === 'paypal') {
      const names = items.map(i => `${i.product.title} ×${i.quantity}`).join('، ');
      fetch('/api/lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: names, amount: total, phone: BILLING_PHONE, method: 'PayPal' }),
      }).catch(() => {});
      const handle = process.env.NEXT_PUBLIC_PAYPAL_ME || 'tiger098';
      // PayPal مبيدعمش الجنيه — نحوّل بسعر الدولار الحيّ (جنيه ÷ سعر الدولار = دولار)
      let egpPerUsd = 50;
      try {
        const r = await fetch('/api/fx');
        const d = await r.json();
        if (d?.egpPerUsd > 0) egpPerUsd = d.egpPerUsd;
      } catch { /* نستخدم القيمة الافتراضية */ }
      const usd = Math.max(1, total / egpPerUsd).toFixed(2);
      window.location.href = `https://www.paypal.me/${handle}/${usd}USD`;
      return;
    }
    // meeza / visa via paymob
    setCheckingOut('meeza');
    try {
      const names = items.map(i => `${i.product.title} ×${i.quantity}`).join('، ');
      const res = await fetch('/api/alerts/paymob', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: names, alertId: 'cart', phone: BILLING_PHONE,
          items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        }),
      });
      const { url, error } = await res.json();
      if (url) window.location.href = url;
      else { alert(typeof error === 'string' ? error : 'تعذر بدء عملية الدفع، حاول مرة أخرى'); setCheckingOut(null); }
    } catch { alert('تعذر بدء عملية الدفع، حاول مرة أخرى'); setCheckingOut(null); }
  };

  const startCheckout = (method: PayMethod) => {
    if (storePaused) { alert(pauseMsg || 'الطلبات متوقفة مؤقتاً، سنعود قريباً'); return; }
    if (!session) { router.push('/auth/signin'); return; }
    if (needing.length > 0) {
      // فيه منتجات بدون بيانات — نطلبها الأول
      setPendingPay(method);
      setShowForm(true);
      setTimeout(() => document.querySelector('.cart-custom')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      return;
    }
    runPayment(method);
  };

  const confirmAndPay = async () => {
    if (!logoUrl && !custName.trim()) { setFormErr('ارفع شعارك أو اكتب اسمك — لازم واحد منهم'); return; }
    if (!contact.trim()) { setFormErr('اكتب وسيلة التواصل — مطلوبة'); return; }
    await sendNeededCustomization();
    if (pendingPay) runPayment(pendingPay);
  };

  const styles = (
    <style>{`
      .cart{min-height:100vh;background:linear-gradient(180deg,#0F083B,#0C0516);color:#d0cce8;
        font-family:'Cairo','29LtBukra','Montserrat',sans-serif;}
      .cart-wrap{max-width:1180px;margin:0 auto;padding:6.5rem 5% 4rem;min-height:100vh;}
      .cart-top{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:2rem;}
      .cart-top h1{font-family:'Oxanium',sans-serif;font-weight:800;font-size:clamp(1.7rem,3.4vw,2.4rem);
        background:linear-gradient(120deg,#fff,#9B59D0);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;margin:0;}
      .cart-back{display:inline-flex;align-items:center;gap:8px;color:rgba(180,168,215,.6);text-decoration:none;font-size:.9rem;transition:color .2s;}
      .cart-back:hover{color:#c8b8f0;}
      .cart-grid{display:grid;grid-template-columns:1fr 360px;gap:1.6rem;align-items:start;}
      @media(max-width:860px){.cart-grid{grid-template-columns:1fr;}}
      .cart-items{display:flex;flex-direction:column;gap:1rem;}
      .cart-item{display:flex;gap:1rem;align-items:center;background:rgba(15,8,59,.5);
        border:1px solid rgba(84,22,181,.18);border-radius:16px;padding:1rem 1.1rem;}
      .cart-item-img{position:relative;width:84px;height:84px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#0a0420;border:1px solid rgba(155,89,208,.22);}
      .cart-item-mid{flex:1;min-width:0;}
      .cart-item-title{font-family:'Oxanium',sans-serif;font-weight:700;font-size:1rem;color:#f0ecff;margin:0 0 3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .cart-item-cat{font-size:.72rem;color:rgba(155,89,208,.7);text-transform:uppercase;letter-spacing:1px;margin-bottom:.7rem;display:flex;align-items:center;gap:8px;}
      .cart-badge{font-size:.62rem;padding:.12rem .5rem;border-radius:50px;font-weight:700;letter-spacing:0;}
      .cart-badge.ok{background:rgba(46,204,113,.15);color:#7ef0a8;border:1px solid rgba(46,204,113,.4);}
      .cart-badge.no{background:rgba(240,131,11,.15);color:#ffcf7a;border:1px solid rgba(240,131,11,.4);}
      .cart-item-row{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;}
      .cart-qty{display:inline-flex;align-items:center;background:rgba(10,4,22,.6);border:1px solid rgba(84,22,181,.3);border-radius:10px;overflow:hidden;}
      .cart-qty button{width:34px;height:34px;border:none;background:transparent;color:#c4a0e0;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;}
      .cart-qty button:hover{background:rgba(84,22,181,.25);color:#fff;}
      .cart-qty span{min-width:36px;text-align:center;font-family:'Oxanium',sans-serif;font-weight:700;color:#f0ecff;font-variant-numeric:tabular-nums;}
      .cart-item-price{font-family:'Oxanium',sans-serif;font-weight:700;color:#c084f5;font-size:1.05rem;}
      .cart-item-del{background:none;border:none;color:#e06a6a;cursor:pointer;padding:6px;transition:color .2s;}
      .cart-item-del:hover{color:#ff8080;}
      .cart-summary{position:sticky;top:6.5rem;background:rgba(15,8,59,.55);border:1px solid rgba(84,22,181,.2);border-radius:18px;padding:1.5rem 1.6rem;box-shadow:0 20px 50px rgba(0,0,0,.4);}
      @media(max-width:860px){.cart-summary{position:static;}}
      .cart-summary h2{font-family:'Oxanium',sans-serif;font-weight:700;font-size:1.15rem;color:#f0ecff;margin:0 0 1.1rem;}
      .cart-lines{display:flex;flex-direction:column;gap:.6rem;margin-bottom:1rem;}
      .cart-line{display:flex;justify-content:space-between;gap:1rem;font-size:.86rem;}
      .cart-line span:first-child{color:rgba(200,190,225,.65);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .cart-line span:last-child{color:#e8e2ff;font-family:'Oxanium',sans-serif;white-space:nowrap;}
      .cart-total{display:flex;justify-content:space-between;align-items:center;padding-top:1rem;margin-bottom:1.4rem;border-top:1px solid rgba(84,22,181,.22);}
      .cart-total .lbl{font-weight:800;color:#f0ecff;}
      .cart-total .val{font-family:'Oxanium',sans-serif;font-weight:800;font-size:1.5rem;background:linear-gradient(135deg,#c084f5,#9B59D0);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
      .cart-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:9px;padding:.9rem 1rem;border:none;border-radius:13px;cursor:pointer;font-family:'Cairo',sans-serif;font-size:.98rem;font-weight:800;transition:all .25s;}
      .cart-btn:disabled{opacity:.6;cursor:default;}
      .cart-btn-meeza{background:linear-gradient(135deg,#3f2072,#5a3382);color:#efe9fb;margin-bottom:.7rem;border:1px solid rgba(155,89,208,.25);}
      .cart-btn-meeza:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 22px rgba(84,22,181,.3);}
      .cart-btn-paypal{background:#FFC439;color:#003087;border:1px solid #E8A900;}
      .cart-btn-paypal .paypal-logo{height:22px;width:auto;display:block;}
      .cart-btn-paypal:hover:not(:disabled){transform:translateY(-2px);background:#F0B90B;box-shadow:0 8px 22px rgba(255,196,57,.4);}
      .cart-clear{width:100%;margin-top:.9rem;background:none;border:none;color:rgba(180,168,215,.45);font-size:.8rem;cursor:pointer;font-family:'Cairo',sans-serif;transition:color .2s;}
      .cart-clear:hover{color:#e06a6a;}
      .cart-note{font-size:.74rem;color:rgba(180,168,215,.45);text-align:center;margin:.9rem 0 0;line-height:1.6;}
      .cart-paused{background:rgba(231,76,60,.1);border:1px solid rgba(231,76,60,.4);border-radius:12px;padding:.9rem 1rem;
        margin-bottom:1rem;text-align:center;display:flex;flex-direction:column;gap:4px;}
      .cart-paused b{color:#ff8080;font-size:.95rem;}
      .cart-paused span{color:rgba(224,176,181,.85);font-size:.8rem;line-height:1.5;}

      /* ── أضفها لسلتك ── */
      .cart-reco{margin-top:2rem;background:rgba(15,8,59,.5);border:1px solid rgba(84,22,181,.2);border-radius:18px;padding:1.4rem 1.6rem;}
      .cart-reco h2{font-family:'Oxanium',sans-serif;font-weight:700;font-size:1.15rem;color:#f0ecff;margin:0 0 .6rem;}
      .cart-reco-list{display:flex;flex-direction:column;}
      .cart-reco-row{display:flex;align-items:center;gap:1rem;padding:.9rem 0;border-bottom:1px solid rgba(84,22,181,.12);}
      .cart-reco-row:last-child{border-bottom:none;}
      .cart-reco-img{width:64px;height:64px;border-radius:10px;object-fit:cover;flex-shrink:0;border:1px solid rgba(155,89,208,.22);}
      .cart-reco-info{flex:1;min-width:0;}
      .cart-reco-name{font-family:'Oxanium',sans-serif;font-weight:700;font-size:.95rem;color:#e8e2ff;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .cart-reco-price{font-family:'Oxanium',sans-serif;font-weight:700;color:#c084f5;font-size:.9rem;}
      .cart-reco-add{flex-shrink:0;padding:.55rem 1.3rem;border:1px solid rgba(155,89,208,.4);border-radius:10px;cursor:pointer;
        font-family:'Cairo',sans-serif;font-size:.82rem;font-weight:700;background:rgba(84,22,181,.18);color:#c8b8f0;transition:all .2s;}
      .cart-reco-add:hover{background:rgba(84,22,181,.35);color:#fff;}
      .cart-reco-add.done{background:rgba(46,204,113,.18);border-color:rgba(46,204,113,.5);color:#7ef0a8;}
      @media(max-width:520px){.cart-reco-name{white-space:normal;} .cart-reco-add{padding:.5rem .9rem;}}

      /* ── Customization gate ── */
      .cart-custom{background:rgba(10,4,22,.55);border:1px solid rgba(240,131,11,.35);border-radius:14px;padding:1.1rem 1.2rem;margin-bottom:1rem;}
      .cart-custom h3{font-family:'Oxanium',sans-serif;font-size:.95rem;font-weight:700;color:#ffcf7a;margin:0 0 .3rem;display:flex;align-items:center;gap:8px;}
      .cart-custom .hint{font-size:.76rem;color:rgba(200,190,225,.6);margin:0 0 .8rem;line-height:1.6;}
      .cart-lbl{display:block;font-size:.78rem;color:rgba(200,190,225,.72);font-weight:700;margin:.7rem 0 .4rem;}
      .cart-lbl .req{color:#e06a6a;}
      .cart-drop{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px;min-height:92px;border:2px dashed rgba(155,89,208,.4);border-radius:11px;padding:10px;cursor:pointer;color:rgba(180,168,215,.7);font-size:.8rem;transition:all .25s;background:rgba(0,0,0,.25);}
      .cart-drop:hover,.cart-drop.over{border-color:#7F3AA1;background:rgba(84,22,181,.12);color:#c8b8f0;}
      .cart-drop.has{padding:6px;border-style:solid;}
      .cart-drop i{font-size:1.3rem;color:#9B59D0;}
      .cart-drop-preview{max-height:100px;max-width:100%;border-radius:7px;object-fit:contain;}
      .cart-drop-clear{margin-top:6px;background:none;border:none;color:#e06a6a;font-size:.74rem;cursor:pointer;font-family:'Cairo',sans-serif;}
      .cart-input{width:100%;padding:.62rem .8rem;border-radius:9px;border:1px solid rgba(84,22,181,.3);background:rgba(0,0,0,.3);color:#f0ecff;font-size:.85rem;font-family:'Cairo',sans-serif;box-sizing:border-box;}
      .cart-input::placeholder{color:rgba(180,168,215,.4);}
      .cart-input:focus{outline:none;border-color:rgba(155,89,208,.6);}
      .cart-err{color:#e06a6a;font-size:.78rem;margin:.6rem 0 0;}
      .cart-confirm{width:100%;margin-top:.9rem;display:flex;align-items:center;justify-content:center;gap:8px;padding:.8rem 1rem;border:none;border-radius:11px;cursor:pointer;font-family:'Cairo',sans-serif;font-size:.9rem;font-weight:800;background:linear-gradient(135deg,#1eaf52,#25D366);color:#fff;transition:all .25s;}
      .cart-confirm:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(37,211,102,.35);}
    `}</style>
  );

  if (items.length === 0) {
    return (
      <div className="cart" dir="rtl">
        {styles}
        <div className="cart-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
            <ShoppingCart size={64} style={{ color: 'rgba(155,89,208,.4)', margin: '0 auto 1rem' }} />
            <h2 style={{ fontFamily: 'Oxanium', fontWeight: 800, fontSize: '1.6rem', color: '#f0ecff', marginBottom: '.5rem' }}>سلتك فاضية</h2>
            <p style={{ color: 'rgba(180,168,215,.5)', marginBottom: '1.8rem' }}>أضف بعض المنتجات المميزة عشان تبدأ</p>
            <Link href="/alerts" className="cart-btn cart-btn-meeza" style={{ display: 'inline-flex', width: 'auto', padding: '.85rem 2rem', textDecoration: 'none' }}>
              تصفّح المنتجات
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart" dir="rtl">
      {styles}
      <div className="cart-wrap">
        <div className="cart-top">
          <h1>سلة الشراء</h1>
          <Link href="/alerts" className="cart-back"><ArrowLeft size={16} /> متابعة التسوق</Link>
        </div>

        <div className="cart-grid">
          {/* Items */}
          <div className="cart-items">
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map(({ product, quantity, customization }) => (
                <motion.div key={product.id} layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20, transition: { duration: 0.22 } }}
                  transition={{ duration: 0.32, ease: [0.25, 0.8, 0.25, 1] }}
                  className="cart-item">
                  <div className="cart-item-img">
                    {product.imageUrl && <Image src={product.imageUrl} alt={product.title} fill className="object-cover" sizes="84px" />}
                  </div>
                  <div className="cart-item-mid">
                    <h3 className="cart-item-title">{product.title}</h3>
                    <div className="cart-item-cat">
                      {product.category.replace('_', ' ')}
                      {customization?.contact
                        ? <span className="cart-badge ok">✓ بياناته مكتملة</span>
                        : <span className="cart-badge no">! محتاج بيانات</span>}
                    </div>
                    <div className="cart-item-row">
                      <div className="cart-qty">
                        <button onClick={() => updateQuantity(product.id, quantity - 1)} aria-label="أقل"><Minus size={14} /></button>
                        <span>{quantity}</span>
                        <button onClick={() => updateQuantity(product.id, quantity + 1)} aria-label="أكثر"><Plus size={14} /></button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span className="cart-item-price">{formatPrice(product.price * quantity)}</span>
                        <button className="cart-item-del" onClick={() => removeItem(product.id)} aria-label="حذف"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h2>ملخص الطلب</h2>
            <div className="cart-lines">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="cart-line">
                  <span>{product.title} ×{quantity}</span>
                   <span>{formatPrice(product.price * quantity)}</span>
                </div>
              ))}
            </div>
            <div className="cart-total">
              <span className="lbl">الإجمالي</span>
              <span className="val">{formatPrice(total)}</span>
            </div>

            {/* Customization gate — يظهر لما فيه منتجات بدون بيانات وضغط الدفع */}
            {showForm && needing.length > 0 && (
              <div className="cart-custom">
                <h3><i className="fas fa-paint-brush" /> أكمل بيانات طلبك</h3>
                <p className="hint">فيه {needing.length} منتج محتاج بيانات (شعار أو اسم + وسيلة تواصل) عشان نسلّمك.</p>

                <label className="cart-lbl">ارفع شعارك</label>
                <div className={`cart-drop${dragOver ? ' over' : ''}${logoUrl ? ' has' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) uploadLogo(f); }}
                  onClick={() => fileRef.current?.click()}>
                  {logoUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img className="cart-drop-preview" src={logoUrl} alt="الشعار" />
                    : uploading ? <span><i className="fas fa-spinner fa-spin" /> جارٍ الرفع...</span>
                    : <span><i className="fas fa-cloud-upload-alt" /> اسحب الشعار أو اضغط للاستعراض</span>}
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }} />
                </div>
                {logoUrl && <button className="cart-drop-clear" onClick={() => setLogoUrl('')}>إزالة الشعار</button>}

                <label className="cart-lbl">أو اكتب اسمك</label>
                <input className="cart-input" value={custName} onChange={e => setCustName(e.target.value)} placeholder="مثال: Tilago" />

                <label className="cart-lbl">وسيلة التواصل <span className="req">*</span></label>
                <input className="cart-input" value={contact} onChange={e => { setContact(e.target.value); setFormErr(''); }} placeholder="تيليجرام / ديسكورد / واتساب" />

                {formErr && <p className="cart-err">{formErr}</p>}

                <button className="cart-confirm" onClick={confirmAndPay}>
                  <i className="fas fa-check" /> تأكيد ومتابعة الدفع
                </button>
              </div>
            )}

            {!showForm && (
              <>
                {storePaused && (
                  <div className="cart-paused">
                    <b>⏸️ الطلبات متوقفة مؤقتاً</b>
                    <span>{pauseMsg || 'نعتذر — الطلبات متوقفة مؤقتاً، سنعود قريباً'}</span>
                  </div>
                )}
                <button className="cart-btn cart-btn-meeza" onClick={() => startCheckout('meeza')} disabled={checkingOut !== null || storePaused}>
                  <CreditCard size={18} /> {checkingOut === 'meeza' ? 'جارٍ التحويل...' : 'الدفع بكارت ميزة / Visa'}
                </button>
                <button className="cart-btn cart-btn-paypal" onClick={() => startCheckout('paypal')} disabled={checkingOut !== null || storePaused}>
                  {checkingOut === 'paypal' ? 'جارٍ التحويل...' : <PayPalLogo height={22} />}
                </button>
                <button className="cart-clear" onClick={clearCart}>إفراغ السلة</button>
                <p className="cart-note">هنتواصل معك على وسيلة التواصل اللي اخترتها لتسليم طلبك.</p>
              </>
            )}
          </div>
        </div>

        {/* أضفها لسلتك — منتجات مقترحة */}
        {recos.length > 0 && (
          <div className="cart-reco">
            <h2>أضفها لسلتك</h2>
            <div className="cart-reco-list">
              <AnimatePresence mode="popLayout" initial={false}>
                {recos.map(p => (
                  <motion.div key={p.id} layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30, transition: { duration: 0.22 } }}
                    transition={{ duration: 0.32, ease: [0.25, 0.8, 0.25, 1] }}
                    className="cart-reco-row">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="cart-reco-img" src={p.image} alt={p.title} loading="lazy" />
                    <div className="cart-reco-info">
                      <div className="cart-reco-name">{p.title}</div>
                      <div className="cart-reco-price">{p.priceLabel ?? formatPrice(p.price)}</div>
                    </div>
                    <button className="cart-reco-add" onClick={() => addReco(p)}>أضف للسلة</button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

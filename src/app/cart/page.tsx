'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// وسيلة التواصل الحقيقية بتتجمّع من صفحة المنتج وبتوصل الأدمن — فمابنطلبش رقم هنا.
// بس بوابات الدفع محتاجة رقم في بيانات الفوترة، فنبعت placeholder.
const BILLING_PHONE = '01000000000';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleMeezaCheckout = async () => {
    if (!session) { router.push('/auth/signin'); return; }
    setCheckingOut(true);
    try {
      const names = items.map(i => `${i.product.title} ×${i.quantity}`).join('، ');
      const res = await fetch('/api/alerts/paymob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: names,
          alertId: 'cart',
          phone: BILLING_PHONE,
          items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        }),
      });
      const { url, error } = await res.json();
      if (url) window.location.href = url;
      else alert(typeof error === 'string' ? error : 'تعذر بدء عملية الدفع، حاول مرة أخرى');
    } catch { alert('تعذر بدء عملية الدفع، حاول مرة أخرى'); }
    finally { setCheckingOut(false); }
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

      /* items */
      .cart-items{display:flex;flex-direction:column;gap:1rem;}
      .cart-item{display:flex;gap:1rem;align-items:center;background:rgba(15,8,59,.5);
        border:1px solid rgba(84,22,181,.18);border-radius:16px;padding:1rem 1.1rem;}
      .cart-item-img{position:relative;width:84px;height:84px;border-radius:12px;overflow:hidden;flex-shrink:0;
        background:#0a0420;border:1px solid rgba(155,89,208,.22);}
      .cart-item-mid{flex:1;min-width:0;}
      .cart-item-title{font-family:'Oxanium',sans-serif;font-weight:700;font-size:1rem;color:#f0ecff;margin:0 0 3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .cart-item-cat{font-size:.72rem;color:rgba(155,89,208,.7);text-transform:uppercase;letter-spacing:1px;margin-bottom:.7rem;}
      .cart-item-row{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;}
      .cart-qty{display:inline-flex;align-items:center;background:rgba(10,4,22,.6);border:1px solid rgba(84,22,181,.3);border-radius:10px;overflow:hidden;}
      .cart-qty button{width:34px;height:34px;border:none;background:transparent;color:#c4a0e0;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;}
      .cart-qty button:hover{background:rgba(84,22,181,.25);color:#fff;}
      .cart-qty span{min-width:36px;text-align:center;font-family:'Oxanium',sans-serif;font-weight:700;color:#f0ecff;font-variant-numeric:tabular-nums;}
      .cart-item-price{font-family:'Oxanium',sans-serif;font-weight:700;color:#c084f5;font-size:1.05rem;}
      .cart-item-del{background:none;border:none;color:#e06a6a;cursor:pointer;padding:6px;transition:color .2s;}
      .cart-item-del:hover{color:#ff8080;}

      /* summary */
      .cart-summary{position:sticky;top:6.5rem;background:rgba(15,8,59,.55);border:1px solid rgba(84,22,181,.2);
        border-radius:18px;padding:1.5rem 1.6rem;box-shadow:0 20px 50px rgba(0,0,0,.4);}
      @media(max-width:860px){.cart-summary{position:static;}}
      .cart-summary h2{font-family:'Oxanium',sans-serif;font-weight:700;font-size:1.15rem;color:#f0ecff;margin:0 0 1.1rem;}
      .cart-lines{display:flex;flex-direction:column;gap:.6rem;margin-bottom:1rem;}
      .cart-line{display:flex;justify-content:space-between;gap:1rem;font-size:.86rem;}
      .cart-line span:first-child{color:rgba(200,190,225,.65);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .cart-line span:last-child{color:#e8e2ff;font-family:'Oxanium',sans-serif;white-space:nowrap;}
      .cart-total{display:flex;justify-content:space-between;align-items:center;padding-top:1rem;margin-bottom:1.4rem;
        border-top:1px solid rgba(84,22,181,.22);}
      .cart-total .lbl{font-weight:800;color:#f0ecff;}
      .cart-total .val{font-family:'Oxanium',sans-serif;font-weight:800;font-size:1.5rem;
        background:linear-gradient(135deg,#c084f5,#9B59D0);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}

      .cart-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:9px;padding:.9rem 1rem;
        border:none;border-radius:13px;cursor:pointer;font-family:'Cairo',sans-serif;font-size:.98rem;font-weight:800;transition:all .25s;}
      .cart-btn:disabled{opacity:.6;cursor:default;}
      .cart-btn-meeza{background:linear-gradient(135deg,#5416B5,#7F3AA1);color:#fff;margin-bottom:.7rem;}
      .cart-btn-meeza:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 22px rgba(84,22,181,.45);}
      .cart-btn-paypal{background:#FFB703;color:#003087;}
      .cart-btn-paypal:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 22px rgba(255,183,3,.35);}
      .cart-clear{width:100%;margin-top:.9rem;background:none;border:none;color:rgba(180,168,215,.45);
        font-size:.8rem;cursor:pointer;font-family:'Cairo',sans-serif;transition:color .2s;}
      .cart-clear:hover{color:#e06a6a;}
      .cart-note{font-size:.74rem;color:rgba(180,168,215,.45);text-align:center;margin:.9rem 0 0;line-height:1.6;}
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
            <AnimatePresence>
              {items.map(({ product, quantity }) => (
                <motion.div key={product.id} layout exit={{ opacity: 0, x: 20 }} className="cart-item">
                  <div className="cart-item-img">
                    {product.imageUrl && <Image src={product.imageUrl} alt={product.title} fill className="object-cover" sizes="84px" />}
                  </div>
                  <div className="cart-item-mid">
                    <h3 className="cart-item-title">{product.title}</h3>
                    <div className="cart-item-cat">{product.category.replace('_', ' ')}</div>
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

            <button className="cart-btn cart-btn-meeza" onClick={handleMeezaCheckout} disabled={checkingOut}>
              <CreditCard size={18} /> {checkingOut ? 'جارٍ التحويل...' : 'الدفع بكارت ميزة / Visa'}
            </button>
            <PayPalButton items={items} total={total} session={session} />

            <button className="cart-clear" onClick={clearCart}>إفراغ السلة</button>
            <p className="cart-note">هنتواصل معك على وسيلة التواصل اللي اخترتها في صفحة المنتج لتسليم طلبك.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PayPalButton({ items, total, session }: any) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayPal = () => {
    if (!session) { router.push('/auth/signin'); return; }
    setLoading(true);
    const names = items.map((i: any) => `${i.product.title} ×${i.quantity}`).join('، ');
    fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: names, amount: total, phone: BILLING_PHONE, method: 'PayPal' }),
    }).catch(() => {});
    const handle = process.env.NEXT_PUBLIC_PAYPAL_ME || 'tiger098';
    window.location.href = `https://www.paypal.me/${handle}/${total.toFixed(2)}`;
  };

  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={handlePayPal} disabled={loading}
      className="cart-btn cart-btn-paypal">
      {loading ? 'Connecting...' : '💳 Pay with PayPal'}
    </motion.button>
  );
}

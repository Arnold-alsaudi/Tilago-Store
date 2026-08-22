'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

export type MiniProduct = {
  id: string;
  ref: string;
  title: string;
  price: number;
  priceLabel: string | null;
  image: string;
  category: string;
};

const priceText = (p: MiniProduct) => p.priceLabel ?? formatPrice(p.price);

const toCartProduct = (m: MiniProduct): Product => ({
  id: m.id,
  title: m.title,
  description: '',
  price: m.price,
  category: m.category as Product['category'],
  imageUrl: m.image,
  videoUrl: null,
  tags: [],
  featured: false,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export function RelatedSections({ current, related }: { current: MiniProduct; related: MiniProduct[] }) {
  const { addItem } = useCart();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [bundleAdded, setBundleAdded] = useState(false);
  const [addedGrid, setAddedGrid] = useState<string | null>(null);

  if (!related.length) return null;

  const bundleExtras = related.slice(0, 3);
  // العنصر الحالي دائماً ضمن الباقة؛ الإضافات مفعّلة افتراضياً
  const isOn = (id: string) => checked[id] ?? true;
  const bundleItems = [current, ...bundleExtras.filter(p => isOn(p.id))];
  const bundleTotal = bundleItems.reduce((s, p) => s + p.price, 0);

  const addBundle = () => {
    bundleItems.forEach(p => addItem(toCartProduct(p)));
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 1800);
  };

  const addOne = (p: MiniProduct) => {
    addItem(toCartProduct(p));
    setAddedGrid(p.id);
    setTimeout(() => setAddedGrid(null), 1400);
  };

  return (
    <div className="rs" dir="rtl">
      <style>{`
        .rs{max-width:1200px;margin:0 auto;padding:1rem 5% 0;
          font-family:'Cairo','29LtBukra','Montserrat',sans-serif;color:#d0cce8;}
        .rs-h{font-family:'Oxanium','29LtBukra',sans-serif;font-weight:800;font-size:clamp(1.3rem,2.6vw,1.7rem);
          color:#f0ecff;margin:2.6rem 0 .3rem;}
        .rs-h span{color:#9B59D0;}
        .rs-sub{color:rgba(180,168,215,.5);font-size:.86rem;margin-bottom:1.4rem;}

        /* ── Frequently bought together ── */
        .rs-bundle{background:rgba(15,8,59,0.5);border:1px solid rgba(84,22,181,.2);border-radius:18px;
          padding:1.4rem 1.5rem;display:flex;flex-direction:column;gap:1rem;}
        .rs-bundle-list{display:flex;flex-direction:column;gap:.2rem;}
        .rs-brow{display:flex;align-items:center;gap:14px;padding:.7rem 0;border-bottom:1px solid rgba(84,22,181,.1);}
        .rs-brow:last-child{border-bottom:none;}
        .rs-check{width:24px;height:24px;border-radius:7px;border:1px solid rgba(155,89,208,.4);flex-shrink:0;
          display:flex;align-items:center;justify-content:center;cursor:pointer;background:rgba(84,22,181,.1);
          color:#fff;font-size:.72rem;transition:all .2s;}
        .rs-check.on{background:linear-gradient(135deg,#5416B5,#7F3AA1);border-color:transparent;}
        .rs-check.fixed{opacity:.55;cursor:default;}
        .rs-bimg{width:52px;height:52px;border-radius:10px;object-fit:cover;flex-shrink:0;border:1px solid rgba(155,89,208,.25);}
        .rs-bname{flex:1;font-size:.9rem;color:#e8e2ff;font-weight:600;text-decoration:none;}
        .rs-bname:hover{color:#c8b8f0;}
        .rs-bname .cur{font-size:.68rem;color:#9B59D0;font-weight:700;margin-inline-start:6px;}
        .rs-bprice{font-family:'Oxanium',sans-serif;font-weight:700;color:#c084f5;white-space:nowrap;font-size:.92rem;}
        .rs-bfoot{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding-top:.4rem;}
        .rs-btotal{font-size:.9rem;color:rgba(200,190,225,.7);}
        .rs-btotal b{font-family:'Oxanium',sans-serif;font-size:1.3rem;color:#f0ecff;margin-inline-start:8px;}
        .rs-badd{display:inline-flex;align-items:center;gap:9px;padding:.8rem 1.6rem;border:none;border-radius:12px;cursor:pointer;
          font-family:'Cairo',sans-serif;font-size:.95rem;font-weight:800;background:linear-gradient(135deg,#5416B5,#7F3AA1);
          color:#fff;box-shadow:0 6px 20px rgba(84,22,181,.4);transition:all .25s;}
        .rs-badd:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(84,22,181,.55);}
        .rs-badd.done{background:linear-gradient(135deg,#1e8e4f,#27ae60);box-shadow:none;}

        /* ── You may like grid ── */
        .rs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1.2rem;}
        .rs-card{background:radial-gradient(ellipse at 50% 10%,rgba(84,22,181,.14),transparent 55%),rgba(15,8,59,.5);
          border:1px solid rgba(84,22,181,.18);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;
          transition:transform .3s,border-color .3s,box-shadow .3s;}
        .rs-card:hover{transform:translateY(-5px);border-color:rgba(155,89,208,.45);box-shadow:0 16px 40px rgba(0,0,0,.4);}
        .rs-card-img{display:block;width:calc(100% - 24px);height:170px;object-fit:cover;margin:12px auto 6px;border-radius:12px;
          border:1px solid rgba(155,89,208,.25);box-shadow:0 8px 20px rgba(0,0,0,.45);transition:transform .4s;}
        .rs-card:hover .rs-card-img{transform:scale(1.03);}
        .rs-card-body{padding:.4rem 1rem 1rem;display:flex;flex-direction:column;flex:1;text-align:center;}
        .rs-card-name{font-size:.9rem;font-weight:700;color:#e8e2ff;margin-bottom:.4rem;text-decoration:none;}
        .rs-card-name:hover{color:#c8b8f0;}
        .rs-card-price{font-family:'Oxanium',sans-serif;font-weight:700;color:#c084f5;font-size:1rem;margin-bottom:.7rem;}
        .rs-card-btn{margin-top:auto;width:100%;display:flex;align-items:center;justify-content:center;gap:7px;
          padding:.55rem 1rem;border:1px solid rgba(155,89,208,.4);border-radius:10px;cursor:pointer;
          font-family:'Cairo',sans-serif;font-size:.82rem;font-weight:700;background:rgba(84,22,181,.15);color:#c8b8f0;transition:all .25s;}
        .rs-card-btn:hover{background:rgba(84,22,181,.35);color:#fff;}
        .rs-card-btn.done{background:rgba(46,204,113,.18);border-color:rgba(46,204,113,.5);color:#7ef0a8;}
      `}</style>

      {/* Frequently bought together */}
      <h2 className="rs-h">كمّل <span>طلبك</span></h2>
      <p className="rs-sub">اكتشف ما يشتريه العملاء مع هذا المنتج</p>
      <div className="rs-bundle">
        <div className="rs-bundle-list">
          <div className="rs-brow">
            <div className="rs-check on fixed"><i className="fas fa-check" /></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="rs-bimg" src={current.image} alt={current.title} />
            <span className="rs-bname">{current.title}<span className="cur">(هذا المنتج)</span></span>
            <span className="rs-bprice">{priceText(current)}</span>
          </div>
          {bundleExtras.map(p => (
            <div key={p.id} className="rs-brow">
              <div className={`rs-check${isOn(p.id) ? ' on' : ''}`}
                onClick={() => setChecked(c => ({ ...c, [p.id]: !isOn(p.id) }))}>
                {isOn(p.id) && <i className="fas fa-check" />}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="rs-bimg" src={p.image} alt={p.title} />
              <Link href={`/product/${p.ref}`} className="rs-bname">{p.title}</Link>
              <span className="rs-bprice">{priceText(p)}</span>
            </div>
          ))}
        </div>
        <div className="rs-bfoot">
          <div className="rs-btotal">الإجمالي ({bundleItems.length} منتجات):<b>{formatPrice(bundleTotal)}</b></div>
          <button className={`rs-badd${bundleAdded ? ' done' : ''}`} onClick={addBundle}>
            {bundleAdded ? <>✓ تمت الإضافة للسلة</> : <><i className="fas fa-cart-plus" /> أضف المحدد للسلة</>}
          </button>
        </div>
      </div>

      {/* You may like */}
      <h2 className="rs-h">منتجات قد <span>تعجبك</span></h2>
      <p className="rs-sub">العملاء اشتروا أيضاً</p>
      <div className="rs-grid">
        {related.slice(0, 8).map(p => (
          <div key={p.id} className="rs-card">
            <Link href={`/product/${p.ref}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="rs-card-img" src={p.image} alt={p.title} />
            </Link>
            <div className="rs-card-body">
              <Link href={`/product/${p.ref}`} className="rs-card-name">{p.title}</Link>
              <div className="rs-card-price">{priceText(p)}</div>
              <button className={`rs-card-btn${addedGrid === p.id ? ' done' : ''}`} onClick={() => addOne(p)}>
                {addedGrid === p.id ? <>✓ أُضيف</> : <><i className="fas fa-plus" /> أضف للسلة</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

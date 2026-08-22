'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

export type ShopItem = {
  id: string;
  ref: string;
  title: string;
  price: number;
  priceLabel: string | null;
  image: string;
  category: string;
  subCategory: string | null;
  rating: number;
  ratingCount: number;
  createdAt: string;
};

const CAT_LABEL: Record<string, string> = {
  ALERTS: 'اليرتات', STREAM: 'ستريم', PACKAGE: 'باكدج', THREE_D: 'ثري دي', VIDEO: 'فيديو',
};

const SORTS: { id: string; label: string }[] = [
  { id: 'newest', label: 'الأحدث' },
  { id: 'price-asc', label: 'السعر: الأقل' },
  { id: 'price-desc', label: 'السعر: الأعلى' },
  { id: 'rating', label: 'الأعلى تقييماً' },
];

const priceText = (p: ShopItem) => p.priceLabel ?? formatPrice(p.price);

export function ShopClient({ items }: { items: ShopItem[] }) {
  const { addItem } = useCart();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<string>('all');
  const [sort, setSort] = useState('newest');
  const [addedId, setAddedId] = useState<string | null>(null);

  const cats = useMemo(() => Array.from(new Set(items.map(i => i.category))), [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter(i =>
      (cat === 'all' || i.category === cat) &&
      (!q || i.title.toLowerCase().includes(q) || (i.subCategory ?? '').toLowerCase().includes(q))
    );
    list = [...list].sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'rating') return b.rating - a.rating || b.ratingCount - a.ratingCount;
      return b.createdAt.localeCompare(a.createdAt); // newest
    });
    return list;
  }, [items, query, cat, sort]);

  const addOne = (p: ShopItem) => {
    addItem({
      id: p.id, title: p.title, description: '', price: p.price,
      category: p.category as Product['category'], imageUrl: p.image, videoUrl: null,
      tags: [], featured: false, active: true, createdAt: new Date(), updatedAt: new Date(),
    } as Product);
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1400);
  };

  return (
    <div className="shop" dir="rtl">
      <style>{`
        .shop{min-height:100vh;background:linear-gradient(180deg,#0F083B,#0C0516);color:#d0cce8;
          font-family:'Cairo','29LtBukra','Montserrat',sans-serif;padding:0 0 4rem;}
        .shop-wrap{max-width:1240px;margin:0 auto;padding:2.2rem 5% 0;}
        .shop-head{text-align:center;margin-bottom:1.8rem;}
        .shop-head h1{font-family:'Oxanium','29LtBukra',sans-serif;font-weight:900;font-size:clamp(1.8rem,4vw,2.7rem);
          color:#f0ecff;margin:0 0 .4rem;}
        .shop-head h1 span{background:linear-gradient(135deg,#9B59D0,#5416B5);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
        .shop-head p{color:rgba(180,168,215,.5);font-size:.92rem;margin:0;}

        /* controls */
        .shop-bar{display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between;
          background:rgba(15,8,59,.5);border:1px solid rgba(84,22,181,.2);border-radius:16px;padding:1rem 1.2rem;margin-bottom:1.5rem;}
        .shop-search{position:relative;flex:1;min-width:220px;}
        .shop-search i{position:absolute;top:50%;right:14px;transform:translateY(-50%);color:rgba(155,89,208,.6);font-size:.9rem;}
        .shop-search input{width:100%;padding:.72rem 2.6rem .72rem 1rem;border-radius:11px;border:1px solid rgba(84,22,181,.3);
          background:rgba(0,0,0,.3);color:#f0ecff;font-size:.92rem;font-family:'Cairo',sans-serif;box-sizing:border-box;}
        .shop-search input::placeholder{color:rgba(180,168,215,.4);}
        .shop-search input:focus{outline:none;border-color:rgba(155,89,208,.6);}
        .shop-sort{display:flex;align-items:center;gap:8px;}
        .shop-sort label{font-size:.82rem;color:rgba(180,168,215,.6);white-space:nowrap;}
        .shop-sort select{padding:.6rem .9rem;border-radius:10px;border:1px solid rgba(84,22,181,.3);
          background:rgba(10,4,22,.7);color:#e8e2ff;font-family:'Cairo',sans-serif;font-size:.85rem;cursor:pointer;}

        .shop-cats{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:1.6rem;}
        .shop-cat{padding:.5rem 1.2rem;border-radius:50px;border:1px solid rgba(84,22,181,.3);cursor:pointer;
          background:rgba(84,22,181,.08);color:rgba(200,190,225,.7);font-size:.85rem;font-weight:700;transition:all .2s;}
        .shop-cat:hover{border-color:rgba(155,89,208,.5);color:#e8e2ff;}
        .shop-cat.on{background:linear-gradient(135deg,#5416B5,#7F3AA1);border-color:transparent;color:#fff;box-shadow:0 4px 14px rgba(84,22,181,.35);}

        .shop-count{font-size:.82rem;color:rgba(180,168,215,.45);margin-bottom:1rem;}

        .shop-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(215px,1fr));gap:1.3rem;}
        .shop-card{background:radial-gradient(ellipse at 50% 10%,rgba(84,22,181,.14),transparent 55%),rgba(15,8,59,.5);
          border:1px solid rgba(84,22,181,.18);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;
          transition:transform .3s,border-color .3s,box-shadow .3s;}
        .shop-card:hover{transform:translateY(-5px);border-color:rgba(155,89,208,.45);box-shadow:0 16px 40px rgba(0,0,0,.4);}
        .shop-card-img{display:block;width:calc(100% - 24px);height:200px;object-fit:cover;margin:12px auto 6px;border-radius:12px;
          border:1px solid rgba(155,89,208,.25);box-shadow:0 8px 20px rgba(0,0,0,.45);transition:transform .4s;}
        .shop-card:hover .shop-card-img{transform:scale(1.03);}
        .shop-card-body{padding:.4rem 1rem 1rem;display:flex;flex-direction:column;flex:1;text-align:center;}
        .shop-card-cat{font-family:'Oxanium',sans-serif;font-size:.6rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;
          color:rgba(155,89,208,.7);margin-bottom:.35rem;}
        .shop-card-name{font-size:.92rem;font-weight:700;color:#e8e2ff;margin-bottom:.35rem;text-decoration:none;}
        .shop-card-name:hover{color:#c8b8f0;}
        .shop-card-meta{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:.7rem;}
        .shop-card-price{font-family:'Oxanium',sans-serif;font-weight:700;color:#c084f5;font-size:1.02rem;}
        .shop-card-rate{font-size:.78rem;color:#F0830B;}
        .shop-card-btn{margin-top:auto;width:100%;display:flex;align-items:center;justify-content:center;gap:7px;
          padding:.55rem 1rem;border:1px solid rgba(155,89,208,.4);border-radius:10px;cursor:pointer;
          font-family:'Cairo',sans-serif;font-size:.82rem;font-weight:700;background:rgba(84,22,181,.15);color:#c8b8f0;transition:all .25s;}
        .shop-card-btn:hover{background:rgba(84,22,181,.35);color:#fff;}
        .shop-card-btn.done{background:rgba(46,204,113,.18);border-color:rgba(46,204,113,.5);color:#7ef0a8;}

        .shop-empty{text-align:center;padding:5rem 1rem;color:rgba(180,168,215,.4);}
        .shop-empty i{font-size:2.6rem;display:block;margin-bottom:1rem;opacity:.4;}
      `}</style>

      <div className="shop-wrap">
        <div className="shop-head">
          <h1>متجر <span>Tilago</span></h1>
          <p>ابحث وفلتر بين كل منتجاتنا في مكان واحد</p>
        </div>

        <div className="shop-bar">
          <div className="shop-search">
            <i className="fas fa-search" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث عن منتج..." />
          </div>
          <div className="shop-sort">
            <label>ترتيب:</label>
            <select value={sort} onChange={e => setSort(e.target.value)}>
              {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="shop-cats">
          <button className={`shop-cat${cat === 'all' ? ' on' : ''}`} onClick={() => setCat('all')}>الكل</button>
          {cats.map(c => (
            <button key={c} className={`shop-cat${cat === c ? ' on' : ''}`} onClick={() => setCat(c)}>
              {CAT_LABEL[c] ?? c}
            </button>
          ))}
        </div>

        <div className="shop-count">{filtered.length} منتج</div>

        {filtered.length === 0 ? (
          <div className="shop-empty">
            <i className="fas fa-box-open" />
            <p>لا توجد منتجات مطابقة</p>
          </div>
        ) : (
          <div className="shop-grid">
            {filtered.map(p => (
              <div key={p.id} className="shop-card">
                <Link href={`/product/${p.ref}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="shop-card-img" src={p.image} alt={p.title} loading="lazy" />
                </Link>
                <div className="shop-card-body">
                  <div className="shop-card-cat">{CAT_LABEL[p.category] ?? p.category}</div>
                  <Link href={`/product/${p.ref}`} className="shop-card-name">{p.title}</Link>
                  <div className="shop-card-meta">
                    <span className="shop-card-price">{priceText(p)}</span>
                    {p.ratingCount > 0 && <span className="shop-card-rate">★ {p.rating}</span>}
                  </div>
                  <button className={`shop-card-btn${addedId === p.id ? ' done' : ''}`} onClick={() => addOne(p)}>
                    {addedId === p.id ? <>✓ أُضيف</> : <><i className="fas fa-cart-plus" /> أضف للسلة</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

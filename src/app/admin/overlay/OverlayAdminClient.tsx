'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, X, Check, Layers, Star, Gift,
  Trophy, Target, Frame, Eye, EyeOff, ExternalLink,
} from 'lucide-react';

export type OverlayCategory = 'SUPPORTERS' | 'CHALLENGES' | 'GOALS' | 'DECOR';

export interface AdminOverlay {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: OverlayCategory;
  file: string;
  poster: string | null;
  isFree: boolean;
  featured: boolean;
  active: boolean;
  sort: number;
  createdAt: string;
}

const CATS: { key: OverlayCategory; name: string; Icon: typeof Gift }[] = [
  { key: 'SUPPORTERS', name: 'داعمين', Icon: Gift },
  { key: 'CHALLENGES', name: 'تحديات', Icon: Trophy },
  { key: 'GOALS',      name: 'أهداف',  Icon: Target },
  { key: 'DECOR',      name: 'تزيين',  Icon: Frame },
];

const catOf = (k: OverlayCategory) => CATS.find(c => c.key === k) ?? CATS[0];

interface Form {
  title: string; slug: string; description: string;
  category: OverlayCategory; file: string; poster: string;
  isFree: boolean; featured: boolean; active: boolean; sort: number;
}

const empty = (): Form => ({
  title: '', slug: '', description: '',
  category: 'SUPPORTERS', file: '/overlays/', poster: '',
  isFree: false, featured: false, active: true, sort: 0,
});

/* الاسم بيتحول لرابط: مسافات تبقى شرطات، وأي حرف مش إنجليزي أو رقم بيتشال.
   ده اقتراح بس — الأدمن يقدر يعدّله. */
function slugify(v: string) {
  return v.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });

export default function OverlayAdminClient({ items }: { items: AdminOverlay[] }) {
  const [list, setList] = useState<AdminOverlay[]>(items);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(empty());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<OverlayCategory | 'ALL'>('ALL');

  const shown = useMemo(
    () => (filter === 'ALL' ? list : list.filter(o => o.category === filter)),
    [list, filter],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: list.length };
    for (const o of list) c[o.category] = (c[o.category] ?? 0) + 1;
    return c;
  }, [list]);

  function startAdd() {
    setEditing(null); setForm(empty()); setError(null); setOpen(true);
  }

  function startEdit(o: AdminOverlay) {
    setEditing(o.id);
    setForm({
      title: o.title, slug: o.slug, description: o.description ?? '',
      category: o.category, file: o.file, poster: o.poster ?? '',
      isFree: o.isFree, featured: o.featured, active: o.active, sort: o.sort,
    });
    setError(null); setOpen(true);
  }

  async function save() {
    setBusy(true); setError(null);
    const body = {
      ...form,
      description: form.description.trim() || null,
      poster: form.poster.trim() || null,
    };
    const url = editing ? `/api/admin/overlays/${editing}` : '/api/admin/overlays';
    try {
      const res = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'حصل خطأ'); return; }
      setList(prev => editing
        ? prev.map(o => (o.id === editing ? { ...o, ...data } : o))
        : [{ ...data }, ...prev]);
      setOpen(false);
    } catch {
      setError('مفيش اتصال بالسيرفر');
    } finally {
      setBusy(false);
    }
  }

  async function remove(o: AdminOverlay) {
    if (!confirm(`تحذف "${o.title}" نهائياً؟`)) return;
    const before = list;
    setList(prev => prev.filter(x => x.id !== o.id));   // تفاؤلي
    const res = await fetch(`/api/admin/overlays/${o.id}`, { method: 'DELETE' });
    if (!res.ok) { setList(before); alert('الحذف فشل'); }
  }

  /* التبديل السريع من على الكارت — بيتحفظ فوراً، ولو فشل بيرجع زي ما كان */
  async function toggle(o: AdminOverlay, field: 'active' | 'isFree' | 'featured') {
    const next = !o[field];
    setList(prev => prev.map(x => (x.id === o.id ? { ...x, [field]: next } : x)));
    const res = await fetch(`/api/admin/overlays/${o.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ [field]: next }),
    });
    if (!res.ok) setList(prev => prev.map(x => (x.id === o.id ? { ...x, [field]: !next } : x)));
  }

  return (
    <div className="oa" dir="rtl">
      <style>{`
        /* نفس نظام الموقع: الألوان الأربعة، كارت 14px، زرار 50px،
           هوفر بيرفع 6px. من غير أي توهّج ملوّن. */
        .oa{
          --deep:#0C0516; --navy:#0F083B; --grape:#5416B5; --violet:#7F3AA1;
          --ink:#e8e4f8; --ink-2:#a09abf; --ink-3:#7d76a0; --accent:#9B59D0;
          --line:rgba(84,22,181,0.2); --line-hot:rgba(84,22,181,0.5);
          --card:rgba(15,8,59,0.5);
          --ok:#4ade80; --warn:#fbbf24;
          min-height:100vh;padding:2.5rem 5% 5rem;
          background:linear-gradient(var(--navy),var(--deep));
          color:var(--ink-2);
          font-family:'Cairo','29LtBukra','Montserrat',sans-serif;
        }
        .oa-in{width:min(96%,1400px);margin:0 auto}

        .oa-top{
          display:flex;align-items:center;justify-content:space-between;
          gap:1rem;flex-wrap:wrap;margin-bottom:1.6rem;
        }
        .oa-title{display:flex;align-items:center;gap:.8rem}
        .oa-title h1{
          font-family:'Oxanium','29LtBukra',sans-serif;font-size:1.5rem;
          font-weight:700;color:var(--ink);margin:0;
        }
        .oa-title p{margin:.2rem 0 0;font-size:.85rem;color:var(--ink-3)}
        .oa-ic{
          width:44px;height:44px;border-radius:12px;display:grid;place-items:center;
          background:rgba(84,22,181,.2);border:1px solid var(--line);color:var(--accent);
        }

        .oa-btn{
          display:inline-flex;align-items:center;gap:.5rem;cursor:pointer;
          font-family:'Cairo',sans-serif;font-size:.9rem;font-weight:600;
          padding:.65rem 1.4rem;border-radius:50px;border:none;
          background:linear-gradient(135deg,var(--grape),var(--violet));color:#fff;
          box-shadow:0 4px 14px rgba(0,0,0,.45);transition:all .3s;
        }
        .oa-btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.55)}
        .oa-btn.ghost{
          background:rgba(84,22,181,.18);border:1px solid var(--line);
          color:var(--ink);box-shadow:none;
        }
        .oa-btn.ghost:hover{background:rgba(84,22,181,.32);border-color:var(--line-hot)}
        .oa-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}
        .oa-btn:focus-visible,.oa-tab:focus-visible,.oa-mini:focus-visible,
        .oa input:focus-visible,.oa select:focus-visible,.oa textarea:focus-visible{
          outline:2px solid var(--violet);outline-offset:2px;
        }

        /* تبويبات التصنيف */
        .oa-tabs{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1.6rem}
        .oa-tab{
          display:inline-flex;align-items:center;gap:.45rem;cursor:pointer;
          font-family:'Cairo',sans-serif;font-size:.86rem;
          padding:.5rem 1rem;border-radius:50px;
          background:rgba(84,22,181,.12);border:1px solid var(--line);color:var(--ink-2);
          transition:all .22s;
        }
        .oa-tab:hover{background:rgba(84,22,181,.26);color:var(--ink)}
        .oa-tab[aria-pressed="true"]{
          background:rgba(84,22,181,.36);border-color:var(--line-hot);color:var(--ink);
        }
        .oa-tab b{
          font-family:'Oxanium',sans-serif;font-size:.76rem;font-weight:700;
          background:rgba(0,0,0,.3);padding:.1rem .4rem;border-radius:50px;color:var(--ink-3);
        }

        /* الكروت */
        .oa-grid{
          display:grid;gap:1.1rem;
          grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));
        }
        .oa-card{
          background:var(--card);border:1px solid var(--line);border-radius:14px;
          overflow:hidden;transition:all .3s ease;display:flex;flex-direction:column;
        }
        .oa-card:hover{transform:translateY(-6px);border-color:var(--line-hot);box-shadow:0 8px 24px rgba(0,0,0,.5)}
        .oa-card.off{opacity:.5}
        .oa-prev{
          position:relative;aspect-ratio:16/9;overflow:hidden;
          background:linear-gradient(160deg,#150c2b,#0a0418);
          border-bottom:1px solid var(--line);
        }
        .oa-prev iframe,.oa-prev img{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}
        .oa-prev img{object-fit:cover}
        .oa-prev .ph{
          position:absolute;inset:0;display:grid;place-items:center;
          color:var(--ink-3);font-size:.82rem;
        }
        .oa-flags{position:absolute;top:8px;right:8px;z-index:2;display:flex;gap:.35rem;flex-wrap:wrap}
        .oa-flag{
          font-family:'Oxanium',sans-serif;font-size:.62rem;font-weight:700;
          letter-spacing:.08em;text-transform:uppercase;
          padding:.2rem .5rem;border-radius:50px;
          background:rgba(12,5,22,.72);border:1px solid rgba(255,255,255,.14);color:#fff;
        }
        .oa-flag.free{color:var(--ok);border-color:rgba(74,222,128,.4)}
        .oa-flag.star{color:var(--warn);border-color:rgba(251,191,36,.4)}

        .oa-body{padding:1rem 1.1rem;display:flex;flex-direction:column;gap:.45rem;flex:1}
        .oa-body h3{
          font-family:'Oxanium','29LtBukra',sans-serif;font-size:1rem;font-weight:700;
          color:var(--ink);margin:0;
        }
        .oa-cat{
          display:inline-flex;align-items:center;gap:.35rem;
          font-size:.78rem;color:var(--accent);
        }
        .oa-desc{font-size:.84rem;line-height:1.7;color:var(--ink-2);margin:0}
        .oa-meta{
          display:flex;gap:.8rem;flex-wrap:wrap;font-size:.74rem;color:var(--ink-3);
          font-family:'Oxanium',sans-serif;margin-top:auto;padding-top:.6rem;
        }
        .oa-slug{direction:ltr;display:inline-block}

        .oa-acts{
          display:flex;gap:.4rem;padding:.7rem 1.1rem 1rem;flex-wrap:wrap;
          border-top:1px solid var(--line);
        }
        .oa-mini{
          display:inline-flex;align-items:center;gap:.35rem;cursor:pointer;
          font-family:'Cairo',sans-serif;font-size:.78rem;
          padding:.4rem .75rem;border-radius:50px;
          background:rgba(84,22,181,.14);border:1px solid var(--line);color:var(--ink-2);
          transition:all .22s;
        }
        .oa-mini:hover{background:rgba(84,22,181,.3);color:var(--ink)}
        .oa-mini.del:hover{background:rgba(220,70,70,.24);border-color:rgba(220,70,70,.5);color:#ffd9d9}
        .oa-mini.on{color:var(--ok);border-color:rgba(74,222,128,.35)}

        .oa-empty{
          border:1px dashed var(--line);border-radius:14px;padding:3.5rem 1.5rem;
          text-align:center;color:var(--ink-3);
        }
        .oa-empty b{display:block;color:var(--ink);font-size:1rem;margin-bottom:.4rem;font-family:'Oxanium',sans-serif}

        /* النموذج */
        .oa-back{
          position:fixed;inset:0;z-index:80;background:rgba(6,2,14,.78);
          backdrop-filter:blur(6px);display:grid;place-items:center;padding:1.2rem;
          overflow-y:auto;
        }
        .oa-form{
          width:min(100%,620px);background:var(--navy);
          border:1px solid var(--line-hot);border-radius:16px;
          padding:1.6rem;margin:auto;
        }
        .oa-form-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.2rem}
        .oa-form-top h2{
          font-family:'Oxanium','29LtBukra',sans-serif;font-size:1.1rem;
          color:var(--ink);margin:0;font-weight:700;
        }
        .oa-x{
          background:none;border:1px solid var(--line);color:var(--ink-2);cursor:pointer;
          width:32px;height:32px;border-radius:50%;display:grid;place-items:center;transition:all .22s;
        }
        .oa-x:hover{background:rgba(84,22,181,.3);color:var(--ink)}

        .oa-row{display:grid;gap:.9rem;margin-bottom:.9rem}
        .oa-row.two{grid-template-columns:1fr 1fr}
        .oa-f label{display:block;font-size:.8rem;color:var(--ink-2);margin-bottom:.35rem}
        .oa-f input,.oa-f select,.oa-f textarea{
          width:100%;padding:.6rem .8rem;border-radius:10px;
          background:rgba(12,5,22,.6);border:1px solid var(--line);
          color:var(--ink);font-family:'Cairo',sans-serif;font-size:.88rem;
        }
        .oa-f input:focus,.oa-f select:focus,.oa-f textarea:focus{border-color:var(--line-hot)}
        .oa-f textarea{resize:vertical;min-height:72px;line-height:1.7}
        .oa-f .ltr{direction:ltr;text-align:left}
        .oa-f small{display:block;margin-top:.3rem;font-size:.74rem;color:var(--ink-3)}

        .oa-checks{display:flex;gap:1.2rem;flex-wrap:wrap;margin:.4rem 0 1.2rem}
        .oa-check{display:inline-flex;align-items:center;gap:.45rem;cursor:pointer;font-size:.86rem;color:var(--ink-2)}
        .oa-check input{width:16px;height:16px;accent-color:var(--violet);cursor:pointer}

        .oa-err{
          background:rgba(220,70,70,.14);border:1px solid rgba(220,70,70,.4);
          color:#ffd9d9;padding:.6rem .9rem;border-radius:10px;
          font-size:.84rem;margin-bottom:.9rem;
        }
        .oa-form-acts{display:flex;gap:.6rem;justify-content:flex-end;flex-wrap:wrap}

        @media(max-width:600px){
          .oa-row.two{grid-template-columns:1fr}
          .oa{padding:1.6rem 4% 4rem}
        }
        @media(prefers-reduced-motion:reduce){.oa *{animation:none!important;transition:none!important}}
      `}</style>

      <div className="oa-in">
        <div className="oa-top">
          <div className="oa-title">
            <span className="oa-ic"><Layers size={22} /></span>
            <div>
              <h1>التركيبات</h1>
              <p>
                {list.length} تركيبة · {list.filter(o => o.active).length} ظاهرة ·{' '}
                {list.filter(o => o.isFree).length} مجانية
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
            <a className="oa-btn ghost" href="/overlay" target="_blank" rel="noreferrer">
              <ExternalLink size={16} /> شوف الصفحة
            </a>
            <button type="button" className="oa-btn" onClick={startAdd}>
              <Plus size={17} /> تركيبة جديدة
            </button>
          </div>
        </div>

        <div className="oa-tabs">
          <button
            type="button" className="oa-tab" aria-pressed={filter === 'ALL'}
            onClick={() => setFilter('ALL')}
          >
            الكل <b>{counts.ALL ?? 0}</b>
          </button>
          {CATS.map(c => (
            <button
              key={c.key} type="button" className="oa-tab"
              aria-pressed={filter === c.key} onClick={() => setFilter(c.key)}
            >
              <c.Icon size={14} /> {c.name} <b>{counts[c.key] ?? 0}</b>
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="oa-empty">
            <b>{list.length === 0 ? 'لسه مفيش تركيبات' : 'مفيش تركيبات في التصنيف ده'}</b>
            {list.length === 0
              ? 'اضغط "تركيبة جديدة" وحط أول واحدة. هتظهر في الكتالوج على طول.'
              : 'جرّب تصنيف تاني أو ضيف تركيبة هنا.'}
          </div>
        ) : (
          <div className="oa-grid">
            <AnimatePresence initial={false}>
              {shown.map(o => {
                const cat = catOf(o.category);
                return (
                  <motion.div
                    key={o.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: .96 }}
                    transition={{ duration: .22 }}
                    className={`oa-card${o.active ? '' : ' off'}`}
                  >
                    <div className="oa-prev">
                      <div className="oa-flags">
                        {o.isFree   && <span className="oa-flag free">مجانية</span>}
                        {o.featured && <span className="oa-flag star">مميزة</span>}
                        {!o.active  && <span className="oa-flag">مخفية</span>}
                      </div>
                      {o.poster
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={o.poster} alt="" loading="lazy" />
                        : o.file
                          ? <iframe src={o.file} title={o.title} loading="lazy" />
                          : <span className="ph">مفيش معاينة</span>}
                    </div>

                    <div className="oa-body">
                      <h3>{o.title}</h3>
                      <span className="oa-cat"><cat.Icon size={13} /> {cat.name}</span>
                      {o.description && <p className="oa-desc">{o.description}</p>}
                      <div className="oa-meta">
                        <span className="oa-slug">/{o.slug}</span>
                        <span>{fmtDate(o.createdAt)}</span>
                      </div>
                    </div>

                    <div className="oa-acts">
                      <button type="button" className="oa-mini" onClick={() => startEdit(o)}>
                        <Edit2 size={13} /> تعديل
                      </button>
                      <button
                        type="button"
                        className={`oa-mini${o.active ? ' on' : ''}`}
                        onClick={() => toggle(o, 'active')}
                      >
                        {o.active ? <Eye size={13} /> : <EyeOff size={13} />}
                        {o.active ? 'ظاهرة' : 'مخفية'}
                      </button>
                      <button
                        type="button"
                        className={`oa-mini${o.isFree ? ' on' : ''}`}
                        onClick={() => toggle(o, 'isFree')}
                      >
                        <Gift size={13} /> مجانية
                      </button>
                      <button
                        type="button"
                        className={`oa-mini${o.featured ? ' on' : ''}`}
                        onClick={() => toggle(o, 'featured')}
                      >
                        <Star size={13} /> مميزة
                      </button>
                      <button type="button" className="oa-mini del" onClick={() => remove(o)}>
                        <Trash2 size={13} /> حذف
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="oa-back"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
          >
            <motion.div
              className="oa-form"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              transition={{ duration: .22 }}
            >
              <div className="oa-form-top">
                <h2>{editing ? 'تعديل التركيبة' : 'تركيبة جديدة'}</h2>
                <button type="button" className="oa-x" onClick={() => setOpen(false)} aria-label="إغلاق">
                  <X size={16} />
                </button>
              </div>

              {error && <div className="oa-err">{error}</div>}

              <div className="oa-row two">
                <div className="oa-f">
                  <label htmlFor="f-title">الاسم</label>
                  <input
                    id="f-title" value={form.title}
                    onChange={e => {
                      const title = e.target.value;
                      setForm(f => ({
                        ...f, title,
                        // الرابط بيتولّد لوحده وانت بتكتب، لحد ما تعدّله بإيدك
                        slug: !editing && (f.slug === '' || f.slug === slugify(f.title))
                          ? slugify(title) : f.slug,
                      }));
                    }}
                    placeholder="لوحة الداعمين"
                  />
                </div>
                <div className="oa-f">
                  <label htmlFor="f-slug">الرابط</label>
                  <input
                    id="f-slug" className="ltr" value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                    placeholder="top-supporters"
                  />
                  <small>بيظهر في /overlay/{form.slug || '...'}</small>
                </div>
              </div>

              <div className="oa-row">
                <div className="oa-f">
                  <label htmlFor="f-desc">الوصف</label>
                  <textarea
                    id="f-desc" value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="ترتيب أكتر ناس بتدعمك، بيتحدّث مع كل هدية"
                  />
                </div>
              </div>

              <div className="oa-row two">
                <div className="oa-f">
                  <label htmlFor="f-cat">التصنيف</label>
                  <select
                    id="f-cat" value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value as OverlayCategory }))}
                  >
                    {CATS.map(c => <option key={c.key} value={c.key}>{c.name}</option>)}
                  </select>
                </div>
                <div className="oa-f">
                  <label htmlFor="f-sort">الترتيب</label>
                  <input
                    id="f-sort" type="number" min={0} max={9999} value={form.sort}
                    onChange={e => setForm(f => ({ ...f, sort: Number(e.target.value) || 0 }))}
                  />
                  <small>الأقل بيظهر الأول</small>
                </div>
              </div>

              <div className="oa-row">
                <div className="oa-f">
                  <label htmlFor="f-file">ملف التركيبة</label>
                  <input
                    id="f-file" className="ltr" value={form.file}
                    onChange={e => setForm(f => ({ ...f, file: e.target.value }))}
                    placeholder="/overlays/my-overlay.html"
                  />
                  <small>المسار اللي هيتحط في OBS وفي المعاينة</small>
                </div>
              </div>

              <div className="oa-row">
                <div className="oa-f">
                  <label htmlFor="f-poster">صورة الكارت</label>
                  <input
                    id="f-poster" className="ltr" value={form.poster}
                    onChange={e => setForm(f => ({ ...f, poster: e.target.value }))}
                    placeholder="اختياري"
                  />
                  <small>لو سيبتها فاضية، الكارت هيعرض التركيبة نفسها شغّالة</small>
                </div>
              </div>

              <div className="oa-checks">
                <label className="oa-check">
                  <input type="checkbox" checked={form.active}
                    onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                  ظاهرة في الكتالوج
                </label>
                <label className="oa-check">
                  <input type="checkbox" checked={form.isFree}
                    onChange={e => setForm(f => ({ ...f, isFree: e.target.checked }))} />
                  مجانية للكل
                </label>
                <label className="oa-check">
                  <input type="checkbox" checked={form.featured}
                    onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
                  مميزة
                </label>
              </div>

              <div className="oa-form-acts">
                <button type="button" className="oa-btn ghost" onClick={() => setOpen(false)}>
                  إلغاء
                </button>
                <button
                  type="button" className="oa-btn" onClick={save}
                  disabled={busy || !form.title.trim() || !form.slug.trim() || !form.file.trim()}
                >
                  <Check size={16} /> {busy ? 'بيحفظ…' : editing ? 'حفظ' : 'إضافة'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

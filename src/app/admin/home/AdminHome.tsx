'use client';

import { useState } from 'react';
import { Upload, Plus, Trash2, Save, Check, Star } from 'lucide-react';
import { DEFAULT_HOME_CONTENT, type HomeContent, type HomeFeature, type HomeStat, type HomeGalleryItem } from '@/lib/homeContent';

export function AdminHome({ initial }: { initial: HomeContent }) {
  const [content, setContent] = useState<HomeContent>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<string | null>(null);

  const upload = async (file: File, key: string): Promise<string | null> => {
    setUploading(key); setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (data.url) return data.url as string;
      setError(data.error ?? 'فشل رفع الصورة');
      return null;
    } catch {
      setError('فشل رفع الصورة');
      return null;
    } finally {
      setUploading(null);
    }
  };

  const setFeat = (i: number, patch: Partial<HomeFeature>) =>
    setContent(c => ({ ...c, features: c.features.map((f, idx) => idx === i ? { ...f, ...patch } : f) }));
  const addFeat = () =>
    setContent(c => ({ ...c, features: [...c.features, { img: '', title: '', desc: '' }] }));
  const removeFeat = (i: number) =>
    setContent(c => ({ ...c, features: c.features.filter((_, idx) => idx !== i) }));

  const setGal = (i: number, patch: Partial<HomeGalleryItem>) =>
    setContent(c => ({ ...c, gallery: c.gallery.map((g, idx) => idx === i ? { ...g, ...patch } : g) }));
  const addGal = () =>
    setContent(c => ({ ...c, gallery: [...c.gallery, { img: '', name: '', tag: '' }] }));
  const removeGal = (i: number) =>
    setContent(c => ({ ...c, gallery: c.gallery.filter((_, idx) => idx !== i) }));
  // كارت واحد بس يبقى الكبير
  const setFeatured = (i: number) =>
    setContent(c => ({ ...c, gallery: c.gallery.map((g, idx) => ({ ...g, featured: idx === i })) }));

  const setStat = (i: number, patch: Partial<HomeStat>) =>
    setContent(c => ({ ...c, stats: c.stats.map((s, idx) => idx === i ? { ...s, ...patch } : s) }));
  const addStat = () =>
    setContent(c => ({ ...c, stats: [...c.stats, { num: '', label: '' }] }));
  const removeStat = (i: number) =>
    setContent(c => ({ ...c, stats: c.stats.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch('/api/admin/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? 'فشل الحفظ'); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { setError('فشل الحفظ، حاول تاني'); }
    finally { setSaving(false); }
  };

  const resetDefaults = () => {
    if (confirm('ترجّع كل حاجة للوضع الافتراضي؟')) setContent(JSON.parse(JSON.stringify(DEFAULT_HOME_CONTENT)));
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(122,0,255,0.3)',
    color: '#F0E6FF', borderRadius: 10, padding: '8px 12px', fontSize: 14, width: '100%',
  };
  const label: React.CSSProperties = { color: '#9B8FC0', fontSize: 12, marginBottom: 4, display: 'block' };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="font-bold text-3xl mb-1" style={{ color: '#F0E6FF' }}>🎨 تعديل الصفحة الرئيسية</h1>
            <p className="text-sm" style={{ color: '#9B8FC0' }}>غيّر صور ونصوص الصفحة الرئيسية من غير كود</p>
          </div>
          <div className="flex gap-2">
            <button onClick={resetDefaults}
              className="px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#9B8FC0', border: '1px solid rgba(255,255,255,0.1)' }}>
              استرجاع الافتراضي
            </button>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: saved ? 'linear-gradient(135deg,#27ae60,#2ecc71)' : 'linear-gradient(135deg,#5416B5,#7F3AA1)', opacity: saving ? 0.6 : 1 }}>
              {saved ? <><Check size={16} /> اتحفظ</> : <><Save size={16} /> {saving ? 'جارٍ الحفظ...' : 'حفظ'}</>}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.4)', color: '#e74c3c' }}>
            {error}
          </div>
        )}

        {/* ── صورة الهيرو ── */}
        <section className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-lg mb-4" style={{ color: '#F0E6FF' }}>🖼️ صورة البانر الرئيسية (Hero)</h2>
          <div className="flex items-center gap-4 flex-wrap">
            {content.heroImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={content.heroImage} alt="hero" style={{ width: 220, height: 120, objectFit: 'cover', borderRadius: 12, border: '1px solid rgba(122,0,255,0.3)' }} />
            )}
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
              style={{ background: 'rgba(84,22,181,0.2)', color: '#c4a0e0', border: '1px solid rgba(84,22,181,0.4)' }}>
              <Upload size={16} /> {uploading === 'hero' ? 'جارٍ الرفع...' : 'رفع صورة'}
              <input type="file" accept="image/*" hidden onChange={async e => {
                const f = e.target.files?.[0]; if (!f) return;
                const url = await upload(f, 'hero'); if (url) setContent(c => ({ ...c, heroImage: url }));
              }} />
            </label>
          </div>
        </section>

        {/* ── قسم "Welcome To Tilago" — العنوان + الكروت ── */}
        <section className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg" style={{ color: '#F0E6FF' }}>✨ قسم الترحيب (Welcome To Tilago)</h2>
            <button onClick={addFeat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: 'rgba(84,22,181,0.2)', color: '#c4a0e0', border: '1px solid rgba(84,22,181,0.4)' }}>
              <Plus size={14} /> إضافة كارت
            </button>
          </div>

          {/* عنوان القسم ووصفه */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div>
              <label style={label}>عنوان القسم</label>
              <input style={inputStyle} value={content.featuresTitle}
                onChange={e => setContent(c => ({ ...c, featuresTitle: e.target.value }))} placeholder="Welcome To Tilago" />
            </div>
            <div>
              <label style={label}>الوصف تحت العنوان</label>
              <input style={inputStyle} value={content.featuresSubtitle}
                onChange={e => setContent(c => ({ ...c, featuresSubtitle: e.target.value }))} placeholder="تصاميم حصرية بلمسة سينمائية..." />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {content.features.map((f, i) => (
              <div key={i} className="flex gap-4 flex-wrap items-start p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  {f.img
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={f.img} alt="" style={{ width: 90, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                    : <div style={{ width: 90, height: 64, borderRadius: 8, background: 'rgba(0,0,0,0.3)' }} />}
                  <label className="flex items-center justify-center gap-1 mt-2 px-2 py-1 rounded-lg text-[11px] cursor-pointer"
                    style={{ background: 'rgba(84,22,181,0.2)', color: '#c4a0e0', border: '1px solid rgba(84,22,181,0.4)' }}>
                    <Upload size={12} /> {uploading === `f${i}` ? '...' : 'صورة'}
                    <input type="file" accept="image/*" hidden onChange={async e => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const url = await upload(file, `f${i}`); if (url) setFeat(i, { img: url });
                    }} />
                  </label>
                </div>
                <div className="flex-1 grid grid-cols-1 gap-2" style={{ minWidth: 240 }}>
                  <div><label style={label}>العنوان</label><input style={inputStyle} value={f.title} onChange={e => setFeat(i, { title: e.target.value })} placeholder="Stream" /></div>
                  <div><label style={label}>الوصف</label><textarea style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }} value={f.desc} onChange={e => setFeat(i, { desc: e.target.value })} /></div>
                </div>
                <button onClick={() => removeFeat(i)} className="p-2 rounded-lg" style={{ background: 'rgba(231,76,60,0.1)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.35)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── شبكة "أكثر من مجرد تصميم" ── */}
        <section className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-lg" style={{ color: '#F0E6FF' }}>🖼️ شبكة &quot;أكثر من مجرد تصميم&quot;</h2>
            <button onClick={addGal} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: 'rgba(84,22,181,0.2)', color: '#c4a0e0', border: '1px solid rgba(84,22,181,0.4)' }}>
              <Plus size={14} /> إضافة كارت
            </button>
          </div>
          <p className="text-xs mb-4" style={{ color: '#9B8FC0' }}>
            اضغط ⭐ على الكارت اللي عايزه يبقى الكبير في نص الشبكة
          </p>
          <div className="flex flex-col gap-4">
            {content.gallery.map((g, i) => (
              <div key={i} className="flex gap-4 flex-wrap items-start p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: g.featured ? '1px solid rgba(240,131,11,0.5)' : '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  {g.img
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={g.img} alt="" style={{ width: 90, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                    : <div style={{ width: 90, height: 64, borderRadius: 8, background: 'rgba(0,0,0,0.3)' }} />}
                  <label className="flex items-center justify-center gap-1 mt-2 px-2 py-1 rounded-lg text-[11px] cursor-pointer"
                    style={{ background: 'rgba(84,22,181,0.2)', color: '#c4a0e0', border: '1px solid rgba(84,22,181,0.4)' }}>
                    <Upload size={12} /> {uploading === `g${i}` ? '...' : 'صورة'}
                    <input type="file" accept="image/*" hidden onChange={async e => {
                      const f = e.target.files?.[0]; if (!f) return;
                      const url = await upload(f, `g${i}`); if (url) setGal(i, { img: url });
                    }} />
                  </label>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2" style={{ minWidth: 220 }}>
                  <div><label style={label}>الاسم</label><input style={inputStyle} value={g.name} onChange={e => setGal(i, { name: e.target.value })} /></div>
                  <div><label style={label}>التصنيف</label><input style={inputStyle} value={g.tag} onChange={e => setGal(i, { tag: e.target.value })} /></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setFeatured(i)} title="اجعله الكارت الكبير"
                    className="p-2 rounded-lg" style={{
                      background: g.featured ? 'rgba(240,131,11,0.18)' : 'rgba(255,255,255,0.04)',
                      color: g.featured ? '#F0830B' : '#9B8FC0',
                      border: `1px solid ${g.featured ? 'rgba(240,131,11,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    }}>
                    <Star size={14} />
                  </button>
                  <button onClick={() => removeGal(i)} className="p-2 rounded-lg"
                    style={{ background: 'rgba(231,76,60,0.1)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.35)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── الأرقام / الإحصائيات ── */}
        <section className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg" style={{ color: '#F0E6FF' }}>📊 الأرقام</h2>
            <button onClick={addStat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: 'rgba(84,22,181,0.2)', color: '#c4a0e0', border: '1px solid rgba(84,22,181,0.4)' }}>
              <Plus size={14} /> إضافة رقم
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {content.stats.map((s, i) => (
              <div key={i} className="flex gap-2 items-end p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 90 }}><label style={label}>الرقم</label><input style={inputStyle} value={s.num} onChange={e => setStat(i, { num: e.target.value })} placeholder="500+" /></div>
                <div className="flex-1"><label style={label}>الوصف</label><input style={inputStyle} value={s.label} onChange={e => setStat(i, { label: e.target.value })} placeholder="عميل راضي" /></div>
                <button onClick={() => removeStat(i)} className="p-2 rounded-lg" style={{ background: 'rgba(231,76,60,0.1)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.35)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <p className="text-xs text-center" style={{ color: '#9B8FC0' }}>
          بعد الحفظ، افتح الصفحة الرئيسية واعمل تحديث (Refresh) عشان تشوف التغييرات
        </p>
      </div>
    </div>
  );
}

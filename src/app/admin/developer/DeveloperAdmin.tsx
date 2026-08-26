'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Upload, X, Save, Code, Video } from 'lucide-react';
import { DEFAULT_DEVELOPER_CONTENT, type DeveloperContent, type DevCategory, type DevProject } from '@/lib/developerContent';
import { uploadVideoDirect } from '@/lib/uploadClient';
import { mediaKind, videoPoster } from '@/lib/media';
import { isYouTubeUrl } from '@/lib/youtube';

const uid = () => Math.random().toString(36).slice(2);

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload failed');
  return (await res.json()).url;
}

type Tab = 'main' | 'services' | 'discord' | 'contacts';

export function DeveloperAdmin() {
  const [c, setC] = useState<DeveloperContent | null>(null);
  const [tab, setTab] = useState<Tab>('main');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    fetch('/api/admin/developer')
      .then(r => r.json())
      .then((d) => setC({ ...DEFAULT_DEVELOPER_CONTENT, ...d }))
      .catch(() => setC(DEFAULT_DEVELOPER_CONTENT));
  }, []);

  const set = (patch: Partial<DeveloperContent>) => setC(prev => prev ? { ...prev, ...patch } : prev);

  const save = async () => {
    if (!c) return;
    setSaving(true); setSavedMsg('');
    try {
      const res = await fetch('/api/admin/developer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c) });
      if (res.ok) { setSavedMsg('✓ تم الحفظ'); setTimeout(() => setSavedMsg(''), 2500); }
      else setSavedMsg('فشل الحفظ');
    } catch { setSavedMsg('فشل الحفظ'); }
    finally { setSaving(false); }
  };

  if (!c) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B8FC0', background: '#0C0516' }}>جارٍ التحميل...</div>;

  return (
    <div className="da" dir="rtl">
      <style>{`
        .da{min-height:100vh;background:radial-gradient(1000px 500px at 85% -10%,rgba(84,22,181,.18),transparent 55%),linear-gradient(180deg,#0F083B,#0C0516);
          padding:2rem 1.5rem 6rem;font-family:'Cairo','29LtBukra',sans-serif;color:#e8e4f8;}
        .da-wrap{max-width:1000px;margin:0 auto;}
        .da-btn{border:none;cursor:pointer;font-family:inherit;transition:all .2s;}
        .da-head{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-bottom:1.6rem;}
        .da-head-l{display:flex;align-items:center;gap:14px;}
        .da-badge{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;
          background:linear-gradient(140deg,#7F3AA1,#5416B5);box-shadow:0 10px 28px rgba(84,22,181,.5);color:#fff;}
        .da-title{font-family:'Oxanium',sans-serif;font-weight:900;font-size:clamp(1.4rem,3vw,2rem);margin:0;
          background:linear-gradient(120deg,#fff,#9B59D0);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
        .da-save{display:flex;align-items:center;gap:8px;padding:.75rem 1.6rem;border-radius:50px;color:#fff;font-weight:800;font-size:.9rem;
          background:linear-gradient(135deg,#5416B5,#7F3AA1);box-shadow:0 8px 22px rgba(84,22,181,.4);}
        .da-save:disabled{opacity:.6;cursor:default;}
        .da-savemsg{font-size:.85rem;color:#7ef0a8;font-weight:700;margin-inline-start:10px;}

        .da-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1.6rem;border-bottom:1px solid rgba(84,22,181,.2);padding-bottom:1rem;}
        .da-tab{padding:.6rem 1.2rem;border-radius:12px;cursor:pointer;font-size:.86rem;font-weight:700;
          background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:rgba(200,190,225,.7);}
        .da-tab.on{background:linear-gradient(135deg,#5416B5,#7F3AA1);color:#fff;border-color:transparent;}

        .da-sec{background:rgba(20,10,48,.5);border:1px solid rgba(84,22,181,.2);border-radius:16px;padding:1.4rem;margin-bottom:1.2rem;}
        .da-sec-h{font-family:'Oxanium',sans-serif;font-weight:800;font-size:1rem;color:#c8a4f0;margin:0 0 1rem;display:flex;align-items:center;gap:8px;}
        .da-fl{display:block;font-size:.74rem;color:rgba(180,168,215,.6);font-weight:700;margin:.9rem 0 .4rem;}
        .da-in{width:100%;padding:.65rem .9rem;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(84,22,181,.3);
          color:#f0ecff;font-size:.88rem;font-family:inherit;outline:none;box-sizing:border-box;}
        .da-in:focus{border-color:#7F3AA1;}
        .da-row{display:flex;gap:12px;flex-wrap:wrap;}
        .da-row>*{flex:1;min-width:120px;}
        .da-up{display:inline-flex;align-items:center;gap:8px;padding:.6rem 1.1rem;border-radius:10px;cursor:pointer;font-size:.8rem;font-weight:700;
          border:1px dashed rgba(84,22,181,.5);background:rgba(84,22,181,.07);color:rgba(180,150,220,.85);}
        .da-up:hover{border-color:#7F3AA1;color:#d4b8f0;}
        .da-thumb{position:relative;width:70px;height:52px;border-radius:8px;overflow:hidden;border:1px solid rgba(84,22,181,.3);flex-shrink:0;}
        .da-thumb img{width:100%;height:100%;object-fit:cover;}
        .da-thumb-x{position:absolute;top:2px;right:2px;width:18px;height:18px;border-radius:50%;background:rgba(0,0,0,.8);color:#fff;border:none;cursor:pointer;font-size:.6rem;display:flex;align-items:center;justify-content:center;}
        .da-item{background:rgba(84,22,181,.06);border:1px solid rgba(84,22,181,.2);border-radius:12px;padding:1rem;margin-bottom:.9rem;}
        .da-item-h{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:.5rem;}
        .da-item-t{font-weight:800;color:#e8e4f8;font-size:.9rem;}
        .da-del{padding:.4rem .6rem;border-radius:8px;background:rgba(220,50,50,.1);border:1px solid rgba(220,50,50,.25);color:rgba(230,120,120,.85);cursor:pointer;}
        .da-add{display:inline-flex;align-items:center;gap:7px;padding:.6rem 1.2rem;border-radius:10px;font-weight:700;font-size:.82rem;cursor:pointer;
          background:rgba(84,22,181,.16);border:1px solid rgba(155,89,208,.35);color:#c8b8f0;}
        .da-add:hover{background:rgba(84,22,181,.3);color:#fff;}
        .da-hint{font-size:.7rem;color:rgba(180,168,215,.4);margin-top:3px;}
        .da-imgs{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px;}
      `}</style>

      <div className="da-wrap">
        {/* Header */}
        <div className="da-head">
          <div className="da-head-l">
            <div className="da-badge"><Code size={24} /></div>
            <div>
              <h1 className="da-title">إدارة صفحة المطوّر</h1>
              <p style={{ color: 'rgba(180,168,215,.5)', fontSize: '.8rem', marginTop: 3 }}>عدّل كل محتوى صفحة الـ Developer</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {savedMsg && <span className="da-savemsg">{savedMsg}</span>}
            <button className="da-btn da-save" onClick={save} disabled={saving}><Save size={16} /> {saving ? 'جارٍ الحفظ...' : 'حفظ الكل'}</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="da-tabs">
          {([['main', 'الرئيسي'], ['services', 'الخدمات والمشاريع'], ['discord', 'الديسكورد والمميزات'], ['contacts', 'التواصل']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} className={`da-btn da-tab${tab === t ? ' on' : ''}`} onClick={() => setTab(t)}>{label}</button>
          ))}
        </div>

        {/* ── MAIN ── */}
        {tab === 'main' && (
          <>
            <div className="da-sec">
              <h3 className="da-sec-h"><i className="fas fa-image" /> صورة الهيرو (البانر)</h3>
              <ImageField value={c.heroImage} onChange={v => set({ heroImage: v })} onBusy={setBusy} busy={busy === 'hero'} busyKey="hero" />
              <div className="da-hint">المقاس المثالي: 1400 × 600 (نسبة ~21:9).</div>
            </div>
            <div className="da-sec">
              <h3 className="da-sec-h"><i className="fas fa-bullhorn" /> صندوق الدعوة (CTA)</h3>
              <label className="da-fl">العنوان</label>
              <input className="da-in" value={c.ctaTitle} onChange={e => set({ ctaTitle: e.target.value })} />
              <label className="da-fl">الوصف</label>
              <textarea className="da-in" rows={2} value={c.ctaSubtitle} onChange={e => set({ ctaSubtitle: e.target.value })} style={{ resize: 'none' }} />
            </div>
            <div className="da-sec">
              <h3 className="da-sec-h"><i className="fab fa-whatsapp" /> رابط الطلب (واتساب)</h3>
              <input className="da-in" dir="ltr" value={c.orderWhatsapp} onChange={e => set({ orderWhatsapp: e.target.value })} placeholder="https://wa.me/201..." />
              <div className="da-hint">زر «اطلب مشروع زيّه» بيفتح الرابط ده.</div>
            </div>
          </>
        )}

        {/* ── SERVICES + PROJECTS ── */}
        {tab === 'services' && (
          <>
            <div className="da-sec">
              <h3 className="da-sec-h"><i className="fas fa-heading" /> عنوان قسم الخدمات</h3>
              <label className="da-fl">العنوان</label>
              <input className="da-in" value={c.servicesTitle} onChange={e => set({ servicesTitle: e.target.value })} />
              <label className="da-fl">الوصف</label>
              <input className="da-in" value={c.servicesSubtitle} onChange={e => set({ servicesSubtitle: e.target.value })} />
            </div>

            {c.categories.map((cat, ci) => (
              <div key={cat.id} className="da-sec">
                <div className="da-item-h">
                  <h3 className="da-sec-h" style={{ margin: 0 }}><i className={cat.icon || 'fas fa-folder'} style={{ color: cat.color }} /> {cat.title || 'قسم'}</h3>
                  <button className="da-del" onClick={() => set({ categories: c.categories.filter((_, i) => i !== ci) })}><Trash2 size={13} /></button>
                </div>
                <div className="da-row">
                  <div><label className="da-fl">اسم القسم</label><input className="da-in" value={cat.title} onChange={e => updateCat(setC, ci, { title: e.target.value })} /></div>
                  <div><label className="da-fl">الأيقونة (FontAwesome)</label><input className="da-in" dir="ltr" value={cat.icon} onChange={e => updateCat(setC, ci, { icon: e.target.value })} placeholder="fas fa-globe" /></div>
                  <div style={{ maxWidth: 110 }}><label className="da-fl">اللون</label><input className="da-in" dir="ltr" value={cat.color} onChange={e => updateCat(setC, ci, { color: e.target.value })} placeholder="#7dd3fc" /></div>
                </div>
                <label className="da-fl">الوصف</label>
                <textarea className="da-in" rows={2} value={cat.desc} onChange={e => updateCat(setC, ci, { desc: e.target.value })} style={{ resize: 'none' }} />
                <label className="da-fl">صورة الغلاف</label>
                <ImageField value={cat.cover} onChange={v => updateCat(setC, ci, { cover: v })} onBusy={setBusy} busy={busy === `cover${ci}`} busyKey={`cover${ci}`} />

                {/* Projects */}
                <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid rgba(84,22,181,.2)' }}>
                  <div className="da-fl" style={{ fontSize: '.8rem', color: 'rgba(155,89,208,.8)' }}>المشاريع ({cat.projects.length})</div>
                  {cat.projects.map((p, pi) => (
                    <div key={p.id} className="da-item">
                      <div className="da-item-h">
                        <span className="da-item-t">{p.title || 'مشروع'}</span>
                        <button className="da-del" onClick={() => updateCat(setC, ci, { projects: cat.projects.filter((_, i) => i !== pi) })}><Trash2 size={13} /></button>
                      </div>
                      <div className="da-row">
                        <div><label className="da-fl">اسم المشروع</label><input className="da-in" value={p.title} onChange={e => updateProject(setC, ci, pi, { title: e.target.value })} /></div>
                        <div><label className="da-fl">رابط مباشر (للمواقع — اختياري)</label><input className="da-in" dir="ltr" value={p.link ?? ''} onChange={e => updateProject(setC, ci, pi, { link: e.target.value })} placeholder="https://..." /></div>
                      </div>
                      <label className="da-fl">الوصف</label>
                      <textarea className="da-in" rows={2} value={p.desc} onChange={e => updateProject(setC, ci, pi, { desc: e.target.value })} style={{ resize: 'none' }} />
                      <label className="da-fl">صور المشروع ({p.images.length})</label>
                      <MultiImages images={p.images} onChange={imgs => updateProject(setC, ci, pi, { images: imgs })} onBusy={setBusy} busy={busy === `proj${ci}-${pi}`} busyKey={`proj${ci}-${pi}`} />
                    </div>
                  ))}
                  <button className="da-btn da-add" onClick={() => updateCat(setC, ci, { projects: [...cat.projects, { id: uid(), title: '', desc: '', images: [] }] })}><Plus size={14} /> مشروع جديد</button>
                </div>
              </div>
            ))}
            <button className="da-btn da-add" onClick={() => set({ categories: [...c.categories, { id: uid(), title: 'قسم جديد', icon: 'fas fa-star', color: '#9B59D0', cover: '', desc: '', projects: [] }] })}><Plus size={14} /> قسم خدمة جديد</button>
          </>
        )}

        {/* ── DISCORD + FEATURES ── */}
        {tab === 'discord' && (
          <>
            <div className="da-sec">
              <h3 className="da-sec-h"><i className="fab fa-discord" /> قسم الديسكورد</h3>
              <label className="da-fl">العنوان</label>
              <input className="da-in" value={c.discordTitle} onChange={e => set({ discordTitle: e.target.value })} />
              <label className="da-fl">الوصف</label>
              <input className="da-in" value={c.discordSubtitle} onChange={e => set({ discordSubtitle: e.target.value })} />
              <div className="da-fl" style={{ marginTop: '1rem', color: 'rgba(155,89,208,.8)' }}>خدمات الديسكورد</div>
              {c.discordServices.map((s, i) => (
                <div key={s.id} className="da-item">
                  <div className="da-item-h">
                    <span className="da-item-t"><i className={s.icon} style={{ color: s.color, marginInlineEnd: 8 }} />{s.title || 'خدمة'}</span>
                    <button className="da-del" onClick={() => set({ discordServices: c.discordServices.filter((_, x) => x !== i) })}><Trash2 size={13} /></button>
                  </div>
                  <div className="da-row">
                    <div><label className="da-fl">العنوان</label><input className="da-in" value={s.title} onChange={e => updateList(setC, 'discordServices', i, { title: e.target.value })} /></div>
                    <div><label className="da-fl">الأيقونة</label><input className="da-in" dir="ltr" value={s.icon} onChange={e => updateList(setC, 'discordServices', i, { icon: e.target.value })} placeholder="fas fa-robot" /></div>
                    <div style={{ maxWidth: 110 }}><label className="da-fl">اللون</label><input className="da-in" dir="ltr" value={s.color} onChange={e => updateList(setC, 'discordServices', i, { color: e.target.value })} /></div>
                  </div>
                  <label className="da-fl">الوصف</label>
                  <textarea className="da-in" rows={2} value={s.desc} onChange={e => updateList(setC, 'discordServices', i, { desc: e.target.value })} style={{ resize: 'none' }} />
                </div>
              ))}
              <button className="da-btn da-add" onClick={() => set({ discordServices: [...c.discordServices, { id: uid(), title: '', icon: 'fas fa-star', color: '#5865F2', desc: '' }] })}><Plus size={14} /> خدمة ديسكورد</button>
            </div>

            <div className="da-sec">
              <h3 className="da-sec-h"><i className="fas fa-gem" /> قسم المميزات</h3>
              <label className="da-fl">العنوان</label>
              <input className="da-in" value={c.featuresTitle} onChange={e => set({ featuresTitle: e.target.value })} />
              <div className="da-fl" style={{ marginTop: '1rem', color: 'rgba(155,89,208,.8)' }}>المميزات</div>
              {c.features.map((f, i) => (
                <div key={f.id} className="da-item">
                  <div className="da-item-h">
                    <span className="da-item-t"><i className={f.icon} style={{ marginInlineEnd: 8 }} />{f.title || 'ميزة'}</span>
                    <button className="da-del" onClick={() => set({ features: c.features.filter((_, x) => x !== i) })}><Trash2 size={13} /></button>
                  </div>
                  <div className="da-row">
                    <div><label className="da-fl">العنوان</label><input className="da-in" value={f.title} onChange={e => updateList(setC, 'features', i, { title: e.target.value })} /></div>
                    <div><label className="da-fl">الأيقونة</label><input className="da-in" dir="ltr" value={f.icon} onChange={e => updateList(setC, 'features', i, { icon: e.target.value })} placeholder="fas fa-bolt" /></div>
                  </div>
                  <label className="da-fl">الوصف</label>
                  <textarea className="da-in" rows={2} value={f.desc} onChange={e => updateList(setC, 'features', i, { desc: e.target.value })} style={{ resize: 'none' }} />
                </div>
              ))}
              <button className="da-btn da-add" onClick={() => set({ features: [...c.features, { id: uid(), title: '', icon: 'fas fa-star', desc: '' }] })}><Plus size={14} /> ميزة</button>
            </div>
          </>
        )}

        {/* ── CONTACTS ── */}
        {tab === 'contacts' && (
          <div className="da-sec">
            <h3 className="da-sec-h"><i className="fas fa-headset" /> أزرار التواصل</h3>
            <div className="da-hint" style={{ marginBottom: '1rem' }}>تظهر في قسم التواصل وفي تفاصيل كل مشروع (تواصل مع المطوّر).</div>
            {c.contacts.map((b, i) => (
              <div key={b.id} className="da-item">
                <div className="da-item-h">
                  <span className="da-item-t"><i className={b.icon} style={{ color: b.color, marginInlineEnd: 8 }} />{b.label || 'زر'}</span>
                  <button className="da-del" onClick={() => set({ contacts: c.contacts.filter((_, x) => x !== i) })}><Trash2 size={13} /></button>
                </div>
                <div className="da-row">
                  <div><label className="da-fl">الاسم</label><input className="da-in" value={b.label} onChange={e => updateList(setC, 'contacts', i, { label: e.target.value })} /></div>
                  <div><label className="da-fl">تحته (وصف صغير)</label><input className="da-in" value={b.sub} onChange={e => updateList(setC, 'contacts', i, { sub: e.target.value })} /></div>
                </div>
                <div className="da-row">
                  <div><label className="da-fl">الأيقونة</label><input className="da-in" dir="ltr" value={b.icon} onChange={e => updateList(setC, 'contacts', i, { icon: e.target.value })} placeholder="fab fa-whatsapp" /></div>
                  <div style={{ maxWidth: 110 }}><label className="da-fl">اللون</label><input className="da-in" dir="ltr" value={b.color} onChange={e => updateList(setC, 'contacts', i, { color: e.target.value })} /></div>
                </div>
                <label className="da-fl">الرابط</label>
                <input className="da-in" dir="ltr" value={b.href} onChange={e => updateList(setC, 'contacts', i, { href: e.target.value })} placeholder="https://wa.me/... أو mailto:..." />
              </div>
            ))}
            <button className="da-btn da-add" onClick={() => set({ contacts: [...c.contacts, { id: uid(), icon: 'fas fa-link', label: 'زر جديد', sub: '', href: '', color: '#9B59D0' }] })}><Plus size={14} /> زر تواصل</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Nested update helpers ── */
type Setter = React.Dispatch<React.SetStateAction<DeveloperContent | null>>;
function updateCat(setC: Setter, ci: number, patch: Partial<DevCategory>) {
  setC(prev => prev ? { ...prev, categories: prev.categories.map((cat, i) => i === ci ? { ...cat, ...patch } : cat) } : prev);
}
function updateProject(setC: Setter, ci: number, pi: number, patch: Partial<DevProject>) {
  setC(prev => prev ? { ...prev, categories: prev.categories.map((cat, i) => i === ci ? { ...cat, projects: cat.projects.map((p, j) => j === pi ? { ...p, ...patch } : p) } : cat) } : prev);
}
function updateList(setC: Setter, key: 'discordServices' | 'features' | 'contacts', idx: number, patch: any) {
  setC(prev => prev ? { ...prev, [key]: (prev[key] as any[]).map((it, i) => i === idx ? { ...it, ...patch } : it) } : prev);
}

/* ── Single image field ── */
function ImageField({ value, onChange, onBusy, busy, busyKey }: { value: string; onChange: (v: string) => void; onBusy: (k: string) => void; busy: boolean; busyKey: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    onBusy(busyKey);
    try { onChange(await uploadImage(f)); } catch {} finally { onBusy(''); e.target.value = ''; }
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <input className="da-in" dir="ltr" value={value} onChange={e => onChange(e.target.value)} placeholder="/photo/... أو رابط" style={{ flex: 1, minWidth: 180 }} />
      <button type="button" className="da-up" onClick={() => ref.current?.click()}><Upload size={13} /> {busy ? '...' : 'رفع'}</button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={pick} />
      {value && <div className="da-thumb">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={value} alt="" /></div>}
    </div>
  );
}

/* ── Media field (صور + فيديو + يوتيوب) ── */
function MultiImages({ images, onChange, onBusy, busy, busyKey }: { images: string[]; onChange: (v: string[]) => void; onBusy: (k: string) => void; busy: boolean; busyKey: string }) {
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);
  const [yt, setYt] = useState('');
  const pickImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []); if (!files.length) return;
    onBusy(busyKey);
    try { const urls = await Promise.all(files.map(uploadImage)); onChange([...images, ...urls]); } catch {} finally { onBusy(''); e.target.value = ''; }
  };
  const pickVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    onBusy(busyKey);
    try { const url = await uploadVideoDirect(f); onChange([...images, url]); } catch {} finally { onBusy(''); e.target.value = ''; }
  };
  const addYt = () => { const v = yt.trim(); if (v && isYouTubeUrl(v)) { onChange([...images, v]); setYt(''); } };
  return (
    <>
      <div className="da-imgs">
        {images.map((m, i) => {
          const kind = mediaKind(m);
          const poster = kind !== 'image' ? videoPoster(m) : null;
          return (
            <div key={i} className="da-thumb">
              {kind === 'image'
                ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={m} alt="" />
                : poster
                  ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={poster} alt="" />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(58,161,161,.14)', color: 'rgba(155,89,208,.7)' }}><Video size={16} /></div>}
              {kind !== 'image' && <span style={{ position: 'absolute', bottom: 2, left: 2, fontSize: '.5rem', fontWeight: 800, padding: '1px 4px', borderRadius: 4, background: 'rgba(58,161,161,.85)', color: '#fff' }}>VID</span>}
              <button type="button" className="da-thumb-x" onClick={() => onChange(images.filter((_, x) => x !== i))}><X size={10} /></button>
            </div>
          );
        })}
        <button type="button" className="da-up" onClick={() => imgRef.current?.click()}><Upload size={13} /> {busy ? '...' : 'رفع صور'}</button>
        <button type="button" className="da-up" onClick={() => vidRef.current?.click()}><Video size={13} /> {busy ? '...' : 'رفع فيديو'}</button>
        <input ref={imgRef} type="file" accept="image/*" multiple hidden onChange={pickImages} />
        <input ref={vidRef} type="file" accept="video/*" hidden onChange={pickVideo} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input className="da-in" dir="ltr" value={yt} onChange={e => setYt(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addYt(); } }} placeholder="رابط يوتيوب..." style={{ flex: 1 }} />
        <button type="button" className="da-up" onClick={addYt} disabled={!isYouTubeUrl(yt)}><Video size={13} /> يوتيوب</button>
      </div>
    </>
  );
}

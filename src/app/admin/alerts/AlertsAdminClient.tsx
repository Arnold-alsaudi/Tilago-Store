'use client';

import { useState, useRef, useMemo } from 'react';
import { Reorder, motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, X, Upload, GripVertical,
  ImagePlus, Video, ChevronDown, Bell, Star, Tag,
} from 'lucide-react';
import { isYouTubeUrl } from '@/lib/youtube';
import { mediaKind, videoPoster } from '@/lib/media';
import { uploadVideoDirect } from '@/lib/uploadClient';

/* ── Subcategories (color-coded) ───────────────────────────── */
const SUBS = [
  { value: 'diamond',  label: 'ماسية',    color: '#5EC8F0', icon: 'fa-gem' },
  { value: 'golden',   label: 'ذهبية',    color: '#F5C542', icon: 'fa-crown' },
  { value: 'platinum', label: 'بلاتينية', color: '#C7CBE0', icon: 'fa-trophy' },
  { value: 'anime',    label: 'أنمي',     color: '#FF6FA5', icon: 'fa-star' },
  { value: 'snow',     label: 'ثلجية',    color: '#8FE3F5', icon: 'fa-snowflake' },
  { value: 'fire',     label: 'ثري دي',   color: '#FF8A3D', icon: 'fa-fire' },
];
const subMeta = (v?: string | null) => SUBS.find(s => s.value === v) ?? { value: v ?? '', label: v ?? '—', color: '#9B59D0', icon: 'fa-bell' };

/* ── Types ─────────────────────────────────────────────────── */
type MediaType = 'image' | 'video';
interface MediaItem { id: string; url: string; type: MediaType; }

interface AlertItem {
  id: string; title: string; description: string; price: number; priceLabel: string | null;
  subCategory: string | null; imageUrl: string; images: string[]; videos: string[];
  videoUrl: string | null; tags: string[]; rating: number; ratingCount: number;
  featured: boolean; active: boolean;
}
interface FormState {
  title: string; description: string; price: string; priceLabel: string;
  subCategory: string; imageUrl: string; media: MediaItem[]; tags: string[];
  rating: number; featured: boolean; active: boolean;
}

const uid = () => Math.random().toString(36).slice(2);
const empty = (): FormState => ({
  title: '', description: '', price: '', priceLabel: '', subCategory: 'diamond',
  imageUrl: '', media: [], tags: [], rating: 5, featured: false, active: true,
});

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload failed');
  return (await res.json()).url;
}

/* ── Component ─────────────────────────────────────────────── */
export function AlertsAdminClient({ alerts: init }: { alerts: AlertItem[] }) {
  const [alerts, setAlerts]   = useState<AlertItem[]>(init);
  const [filter, setFilter]   = useState<string>('all');
  const [modal, setModal]     = useState(false);
  const [editId, setEditId]   = useState<string | null>(null);
  const [form, setForm]       = useState<FormState>(empty());
  const [showReorder, setShowReorder] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState<'cover' | 'img' | 'video' | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newTag, setNewTag]   = useState('');
  const [uploadErr, setUploadErr] = useState('');

  const coverRef = useRef<HTMLInputElement>(null);
  const imgRef   = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const shown = useMemo(
    () => filter === 'all' ? alerts : alerts.filter(a => a.subCategory === filter),
    [alerts, filter],
  );

  function openAdd() { setEditId(null); setForm(empty()); setShowReorder(false); setNewVideoUrl(''); setNewTag(''); setUploadErr(''); setModal(true); }

  function openEdit(a: AlertItem) {
    setEditId(a.id);
    const media: MediaItem[] = (a.images ?? []).map(u => ({ id: uid(), url: u, type: mediaKind(u) === 'image' ? 'image' : 'video' }));
    setForm({
      title: a.title, description: a.description ?? '', price: String(a.price ?? ''),
      priceLabel: a.priceLabel ?? '', subCategory: a.subCategory ?? 'diamond',
      imageUrl: a.imageUrl, media, tags: a.tags ?? [], rating: a.rating ?? 5,
      featured: a.featured, active: a.active,
    });
    setShowReorder(false); setNewVideoUrl(''); setNewTag(''); setUploadErr(''); setModal(true);
  }

  function closeModal() { setModal(false); setEditId(null); }

  async function pickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading('cover'); setUploadErr('');
    try { const url = await uploadFile(file); setForm(f => ({ ...f, imageUrl: url })); }
    catch { setUploadErr('فشل رفع الغلاف'); }
    finally { setUploading(null); e.target.value = ''; }
  }

  async function pickImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []); if (!files.length) return;
    setUploading('img'); setUploadErr('');
    try {
      const urls = await Promise.all(files.map(uploadFile));
      setForm(f => ({ ...f, media: [...f.media, ...urls.map(u => ({ id: uid(), url: u, type: 'image' as const }))] }));
    } catch { setUploadErr('فشل رفع الصور'); }
    finally { setUploading(null); e.target.value = ''; }
  }

  async function pickVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading('video'); setUploadErr('');
    try {
      const url = await uploadVideoDirect(file);
      setForm(f => ({ ...f, media: [...f.media, { id: uid(), url, type: 'video' as const }] }));
    } catch (err: any) { setUploadErr(err?.message ?? 'فشل رفع الفيديو'); }
    finally { setUploading(null); e.target.value = ''; }
  }

  function addVideoLink() {
    const url = newVideoUrl.trim();
    if (!url || !isYouTubeUrl(url)) return;
    setForm(f => ({ ...f, media: [...f.media, { id: uid(), url, type: 'video' as const }] }));
    setNewVideoUrl('');
  }
  function removeMedia(id: string) { setForm(f => ({ ...f, media: f.media.filter(m => m.id !== id) })); }

  function addTag() {
    const t = newTag.trim();
    if (!t || form.tags.includes(t)) { setNewTag(''); return; }
    setForm(f => ({ ...f, tags: [...f.tags, t] }));
    setNewTag('');
  }
  function removeTag(t: string) { setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) })); }

  async function save() {
    if (!form.title.trim()) return;
    setSaving(true);
    const orderedUrls = form.media.map(m => m.url);
    const videoUrls   = form.media.filter(m => m.type === 'video').map(m => m.url);
    const body = {
      title: form.title.trim(),
      description: form.description.trim() || form.title.trim(),
      price: parseFloat(form.price) || 0,
      priceLabel: form.priceLabel.trim() || null,
      category: 'ALERTS', subCategory: form.subCategory,
      imageUrl: form.imageUrl || orderedUrls.find(u => mediaKind(u) === 'image') || '',
      images: orderedUrls,
      videos: videoUrls,
      videoUrl: videoUrls[0] ?? null,
      tags: form.tags,
      rating: form.rating,
      featured: form.featured, active: form.active,
    };
    try {
      if (editId) {
        const res = await fetch(`/api/products/${editId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const updated = await res.json().catch(() => null);
        setAlerts(as => as.map(a => a.id === editId ? ({ ...a, ...(updated ?? body), id: editId } as AlertItem) : a));
      } else {
        const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const created = await res.json();
        setAlerts(as => [{ ...body, id: created.id, ratingCount: 0 } as AlertItem, ...as]);
      }
      closeModal();
    } finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm('حذف الأليرت نهائياً؟')) return;
    setDeleting(id);
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setAlerts(as => as.filter(a => a.id !== id));
    setDeleting(null);
  }

  const imgCount = form.media.filter(m => m.type === 'image').length;
  const vidCount = form.media.filter(m => m.type === 'video').length;
  const previewPrice = form.priceLabel.trim() || (form.price ? `${form.price} EGP` : '—');
  const previewCover = form.imageUrl || form.media.find(m => m.type === 'image')?.url || '';
  const sm = subMeta(form.subCategory);

  return (
    <div className="al-root" dir="rtl">
      <style>{`
        .al-root { min-height:100vh; background:radial-gradient(1200px 600px at 80% -10%, rgba(84,22,181,.18), transparent 60%), linear-gradient(180deg,#0F083B,#0C0516); padding:2rem 1.5rem 4rem; font-family:'Cairo','29LtBukra','Montserrat',sans-serif; color:#e8e4f8; }
        .al-wrap { max-width:1180px; margin:0 auto; }
        .al-btn { border:none; cursor:pointer; font-family:inherit; transition:all .2s; }

        /* Header */
        .al-head { display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:1.8rem; }
        .al-head-l { display:flex; align-items:center; gap:16px; }
        .al-badge { width:56px; height:56px; border-radius:18px; display:flex; align-items:center; justify-content:center; flex-shrink:0;
          background:linear-gradient(140deg,#7F3AA1,#5416B5); box-shadow:0 10px 30px rgba(84,22,181,.5), inset 0 1px 0 rgba(255,255,255,.25); color:#fff; }
        .al-title { font-family:'Oxanium',sans-serif; font-weight:900; font-size:clamp(1.5rem,3vw,2.1rem); margin:0; line-height:1.1;
          background:linear-gradient(120deg,#fff,#c8a4f0 60%,#9B59D0); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
        .al-sub { color:rgba(180,168,215,.6); font-size:.85rem; margin-top:3px; }
        .al-add { display:flex; align-items:center; gap:9px; padding:.8rem 1.6rem; border-radius:50px; color:#fff; font-weight:800; font-size:.9rem;
          background:linear-gradient(135deg,#5416B5,#7F3AA1); box-shadow:0 8px 24px rgba(84,22,181,.45); }
        .al-add:hover { transform:translateY(-2px); box-shadow:0 12px 30px rgba(84,22,181,.6); }

        /* Stats */
        .al-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:1.6rem; }
        @media(max-width:720px){ .al-stats{ grid-template-columns:repeat(2,1fr); } }
        .al-stat { background:rgba(20,10,48,.55); border:1px solid rgba(84,22,181,.2); border-radius:16px; padding:1.1rem 1.2rem; backdrop-filter:blur(8px); }
        .al-stat-n { font-family:'Oxanium',sans-serif; font-weight:800; font-size:1.7rem; color:#c8a4f0; line-height:1; }
        .al-stat-l { font-size:.74rem; color:rgba(180,168,215,.55); margin-top:6px; letter-spacing:.4px; }

        /* Filters */
        .al-filters { display:flex; gap:9px; flex-wrap:wrap; margin-bottom:1.6rem; }
        .al-pill { display:inline-flex; align-items:center; gap:7px; padding:.5rem 1rem; border-radius:50px; cursor:pointer; font-size:.82rem; font-weight:700;
          background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); color:rgba(200,190,225,.7); transition:all .2s; }
        .al-pill:hover { border-color:rgba(155,89,208,.4); color:#e8e4f8; }
        .al-pill.on { color:#fff; }
        .al-pill .cnt { font-size:.66rem; opacity:.8; background:rgba(0,0,0,.28); padding:1px 7px; border-radius:20px; }

        /* Grid */
        .al-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:1.1rem; }
        .al-card { position:relative; border-radius:18px; overflow:hidden; background:rgba(15,8,59,.55); border:1px solid rgba(84,22,181,.2);
          box-shadow:0 8px 26px rgba(0,0,0,.35); transition:transform .28s cubic-bezier(.25,.8,.25,1), border-color .28s, box-shadow .28s; }
        .al-card:hover { transform:translateY(-6px); border-color:rgba(155,89,208,.5); box-shadow:0 16px 40px rgba(84,22,181,.28); }
        .al-card-cover { position:relative; width:100%; height:150px; overflow:hidden; background:#0a0420; }
        .al-card-cover img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .5s; }
        .al-card:hover .al-card-cover img { transform:scale(1.07); }
        .al-card-grad { position:absolute; inset:0; background:linear-gradient(to top,rgba(8,3,20,.95),rgba(8,3,20,.15) 55%,transparent); }
        .al-card-sub { position:absolute; top:10px; right:10px; display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:50px;
          font-size:.62rem; font-weight:800; letter-spacing:.5px; backdrop-filter:blur(8px); }
        .al-card-star { position:absolute; top:10px; left:10px; width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center;
          background:rgba(245,197,66,.16); border:1px solid rgba(245,197,66,.5); color:#F5C542; }
        .al-card-body { padding:12px 14px 14px; }
        .al-card-title { font-weight:800; font-size:.95rem; color:#f0ecff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .al-card-desc { font-size:.72rem; color:rgba(180,168,215,.5); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .al-card-row { display:flex; align-items:center; justify-content:space-between; margin-top:10px; }
        .al-card-price { font-family:'Oxanium',sans-serif; font-weight:800; font-size:.95rem; color:#c8a4f0; }
        .al-card-meta { font-size:.66rem; color:rgba(155,89,208,.6); display:flex; gap:9px; }
        .al-card-actions { display:flex; gap:7px; margin-top:12px; }
        .al-card-edit { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:.5rem; border-radius:10px; font-size:.78rem; font-weight:700;
          background:rgba(84,22,181,.16); border:1px solid rgba(84,22,181,.32); color:#c4a0e0; }
        .al-card-edit:hover { background:rgba(84,22,181,.3); color:#fff; }
        .al-card-del { padding:.5rem .75rem; border-radius:10px; background:rgba(220,50,50,.1); border:1px solid rgba(220,50,50,.25); color:rgba(230,120,120,.85); }
        .al-card-del:hover { background:rgba(220,50,50,.2); }
        .al-hidden-tag { position:absolute; bottom:10px; left:10px; font-size:.6rem; font-weight:700; padding:2px 8px; border-radius:20px; background:rgba(0,0,0,.6); color:#ff9a9a; }

        .al-empty { text-align:center; padding:70px 20px; color:rgba(155,89,208,.4); }
        .al-empty i { font-size:3rem; display:block; margin-bottom:14px; opacity:.5; }

        /* Modal */
        .al-modal-bg { position:fixed; inset:0; z-index:500; background:rgba(4,1,12,.72); backdrop-filter:blur(6px); display:flex; align-items:flex-start; justify-content:center; overflow-y:auto; padding:2rem 1rem; }
        .al-modal { width:100%; max-width:900px; background:linear-gradient(180deg,#0d0620,#0a0514); border:1px solid rgba(84,22,181,.35); border-radius:22px; overflow:hidden; box-shadow:0 30px 90px rgba(0,0,0,.85); }
        .al-modal-head { display:flex; align-items:center; justify-content:space-between; padding:1.2rem 1.6rem; border-bottom:1px solid rgba(84,22,181,.2); background:rgba(84,22,181,.06); }
        .al-modal-head h2 { font-family:'Oxanium',sans-serif; font-weight:800; font-size:1.05rem; color:#f0ecff; margin:0; }
        .al-modal-head .x { width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); color:rgba(200,185,230,.7); display:flex; align-items:center; justify-content:center; }
        .al-modal-body { display:grid; grid-template-columns:1fr 300px; gap:0; }
        @media(max-width:800px){ .al-modal-body{ grid-template-columns:1fr; } .al-preview-pane{ display:none; } }
        .al-form { padding:1.5rem 1.6rem; }
        .al-sec { margin-bottom:1.5rem; }
        .al-sec-label { display:flex; align-items:center; gap:8px; font-size:.7rem; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:rgba(155,89,208,.7); margin-bottom:.8rem; }
        .al-input { width:100%; padding:.7rem 1rem; border-radius:11px; background:rgba(255,255,255,.04); border:1px solid rgba(84,22,181,.3); color:#f0ecff; font-size:.9rem; font-family:inherit; outline:none; box-sizing:border-box; }
        .al-input:focus { border-color:#7F3AA1; background:rgba(84,22,181,.08); }
        .al-input::placeholder { color:rgba(180,170,210,.35); }
        .al-row2 { display:flex; gap:12px; flex-wrap:wrap; }
        .al-field { flex:1; min-width:130px; }
        .al-fl { font-size:.72rem; color:rgba(180,168,215,.6); font-weight:700; margin-bottom:.4rem; display:block; }

        /* Subcategory pills */
        .al-subs { display:flex; gap:9px; flex-wrap:wrap; }
        .al-subpill { display:inline-flex; align-items:center; gap:8px; padding:.55rem 1rem; border-radius:12px; cursor:pointer; font-size:.82rem; font-weight:700;
          background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); color:rgba(200,190,225,.65); transition:all .2s; }
        .al-subpill:hover { color:#f0ecff; }

        /* Tags */
        .al-tags { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:.7rem; }
        .al-tag { display:inline-flex; align-items:center; gap:6px; padding:.35rem .7rem; border-radius:8px; font-size:.76rem; font-weight:700;
          background:rgba(84,22,181,.16); border:1px solid rgba(155,89,208,.3); color:#c8b8f0; }
        .al-tag button { background:none; border:none; color:#e06a6a; cursor:pointer; display:flex; padding:0; }

        /* Upload buttons */
        .al-up { display:inline-flex; align-items:center; gap:8px; padding:.6rem 1.15rem; border-radius:11px; border:1px dashed rgba(84,22,181,.5); background:rgba(84,22,181,.07); color:rgba(180,150,220,.85); font-size:.82rem; font-weight:700; cursor:pointer; transition:all .2s; }
        .al-up:hover { border-color:#7F3AA1; background:rgba(84,22,181,.14); color:#d4b8f0; }

        /* Media grid */
        .al-media-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(70px,1fr)); gap:8px; margin-top:.8rem; }
        .al-media { position:relative; border-radius:9px; overflow:hidden; aspect-ratio:1; background:rgba(84,22,181,.08); }
        .al-media img { width:100%; height:100%; object-fit:cover; display:block; }
        .al-media-vid { width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(58,161,161,.12); }
        .al-media-type { position:absolute; bottom:3px; left:3px; font-size:.5rem; font-weight:800; padding:1px 5px; border-radius:4px; color:#fff; }
        .al-media-del { position:absolute; top:3px; right:3px; width:19px; height:19px; border-radius:50%; background:rgba(0,0,0,.75); border:none; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .2s; }
        .al-media:hover .al-media-del { opacity:1; }

        /* Reorder */
        .al-reorder-row { display:flex; align-items:center; gap:10px; padding:.6rem .85rem; border-radius:10px; background:rgba(255,255,255,.03); border:1px solid rgba(84,22,181,.15); margin-bottom:6px; cursor:grab; }
        .al-reorder-row:active { cursor:grabbing; background:rgba(84,22,181,.1); }
        .al-reorder-thumb { width:42px; height:30px; border-radius:6px; object-fit:cover; flex-shrink:0; }
        .al-reorder-url { flex:1; font-size:.68rem; color:rgba(170,155,200,.5); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; direction:ltr; }

        /* Toggles */
        .al-toggle { display:flex; align-items:center; gap:10px; cursor:pointer; user-select:none; }
        .al-toggle-box { width:42px; height:23px; border-radius:12px; position:relative; transition:background .2s; }
        .al-toggle-thumb { position:absolute; top:3px; width:17px; height:17px; border-radius:50%; background:#fff; transition:left .2s; }

        /* Preview pane */
        .al-preview-pane { border-right:1px solid rgba(84,22,181,.18); padding:1.5rem 1.3rem; background:rgba(84,22,181,.04); }
        .al-preview-label { font-size:.66rem; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:rgba(155,89,208,.55); margin-bottom:1rem; text-align:center; }
        .al-pcard { border-radius:16px; overflow:hidden; background:rgba(15,8,59,.7); border:1px solid rgba(84,22,181,.28); box-shadow:0 12px 34px rgba(0,0,0,.4); }
        .al-pcard-cover { position:relative; width:100%; height:150px; background:#0a0420; }
        .al-pcard-cover img { width:100%; height:100%; object-fit:cover; }
        .al-pcard-cover .ph { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:rgba(155,89,208,.3); font-size:2rem; }
        .al-pcard-grad { position:absolute; inset:0; background:linear-gradient(to top,rgba(8,3,20,.92),transparent 60%); }
        .al-pcard-sub { position:absolute; top:9px; right:9px; padding:3px 9px; border-radius:50px; font-size:.6rem; font-weight:800; backdrop-filter:blur(8px); }
        .al-pcard-body { padding:12px 14px 15px; }
        .al-pcard-title { font-weight:800; font-size:1rem; color:#f0ecff; }
        .al-pcard-stars { color:#F0830B; font-size:.8rem; letter-spacing:1px; margin:4px 0 8px; }
        .al-pcard-price { font-family:'Oxanium',sans-serif; font-weight:800; font-size:1.15rem; color:#c8a4f0; }

        /* Actions */
        .al-actions { display:flex; gap:10px; padding-top:.4rem; }
        .al-save { flex:1; padding:.85rem; border-radius:12px; color:#fff; font-weight:800; font-size:.95rem; box-shadow:0 6px 20px rgba(84,22,181,.35); }
        .al-cancel { padding:.85rem 1.4rem; border-radius:12px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); color:rgba(200,185,230,.6); font-weight:700; }
      `}</style>

      <div className="al-wrap">
        {/* Header */}
        <div className="al-head">
          <div className="al-head-l">
            <div className="al-badge"><Bell size={26} /></div>
            <div>
              <h1 className="al-title">إدارة الأليرتات</h1>
              <p className="al-sub">أضف أليرت، رتّب الصور والفيديوهات، وخصّص القسم والسعر</p>
            </div>
          </div>
          <button className="al-btn al-add" onClick={openAdd}><Plus size={17} /> أليرت جديد</button>
        </div>

        {/* Stats */}
        <div className="al-stats">
          {[
            { n: alerts.length, l: 'إجمالي الأليرتات' },
            { n: alerts.filter(a => a.active).length, l: 'نشط' },
            { n: alerts.filter(a => a.featured).length, l: 'مميز' },
            { n: new Set(alerts.map(a => a.subCategory)).size, l: 'أقسام مستخدمة' },
          ].map(s => (
            <div key={s.l} className="al-stat">
              <div className="al-stat-n">{s.n}</div>
              <div className="al-stat-l">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="al-filters">
          <button className={`al-btn al-pill${filter === 'all' ? ' on' : ''}`}
            onClick={() => setFilter('all')}
            style={filter === 'all' ? { background: 'rgba(155,89,208,.22)', borderColor: 'rgba(155,89,208,.55)' } : undefined}>
            <i className="fas fa-layer-group" /> الكل <span className="cnt">{alerts.length}</span>
          </button>
          {SUBS.map(s => {
            const c = alerts.filter(a => a.subCategory === s.value).length;
            const on = filter === s.value;
            return (
              <button key={s.value} className={`al-btn al-pill${on ? ' on' : ''}`} onClick={() => setFilter(s.value)}
                style={on ? { background: `${s.color}22`, borderColor: `${s.color}88`, color: s.color } : undefined}>
                <i className={`fas ${s.icon}`} style={{ color: s.color }} /> {s.label} <span className="cnt">{c}</span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {shown.length === 0 ? (
          <div className="al-empty"><i className="fas fa-bell-slash" /><p>لا توجد أليرتات في هذا القسم</p></div>
        ) : (
          <div className="al-grid">
            {shown.map(a => {
              const m = subMeta(a.subCategory);
              const imgC = (a.images ?? []).filter(u => mediaKind(u) === 'image').length;
              const vidC = (a.images ?? []).filter(u => mediaKind(u) !== 'image').length;
              return (
                <div key={a.id} className="al-card">
                  <div className="al-card-cover">
                    {a.imageUrl
                      ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={a.imageUrl} alt={a.title} />
                      : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(155,89,208,.3)' }}><ImagePlus size={30} /></div>}
                    <div className="al-card-grad" />
                    <span className="al-card-sub" style={{ background: `${m.color}26`, color: m.color, border: `1px solid ${m.color}66` }}>
                      <i className={`fas ${m.icon}`} /> {m.label}
                    </span>
                    {a.featured && <span className="al-card-star"><Star size={13} fill="currentColor" /></span>}
                    {!a.active && <span className="al-hidden-tag">مخفي</span>}
                  </div>
                  <div className="al-card-body">
                    <div className="al-card-title">{a.title}</div>
                    <div className="al-card-desc">{a.description}</div>
                    <div className="al-card-row">
                      <span className="al-card-price">{a.priceLabel || (a.price ? `${a.price} EGP` : '—')}</span>
                      <span className="al-card-meta"><span>🖼 {imgC}</span><span>🎬 {vidC}</span></span>
                    </div>
                    <div className="al-card-actions">
                      <button className="al-btn al-card-edit" onClick={() => openEdit(a)}><Edit2 size={13} /> تعديل</button>
                      <button className="al-btn al-card-del" onClick={() => del(a.id)} disabled={deleting === a.id}>
                        {deleting === a.id ? '...' : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hidden inputs */}
      <input ref={coverRef} type="file" accept="image/*"          style={{ display: 'none' }} onChange={pickCover} />
      <input ref={imgRef}   type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={pickImages} />
      <input ref={videoRef} type="file" accept="video/*"          style={{ display: 'none' }} onChange={pickVideo} />

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div className="al-modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
            <motion.div className="al-modal" initial={{ scale: .96, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: .96, opacity: 0 }}
              onClick={e => e.stopPropagation()}>
              <div className="al-modal-head">
                <h2>{editId ? 'تعديل الأليرت' : 'أليرت جديد'}</h2>
                <button className="al-btn x" onClick={closeModal}><X size={15} /></button>
              </div>

              <div className="al-modal-body">
                {/* Live preview */}
                <div className="al-preview-pane">
                  <div className="al-preview-label">معاينة حيّة</div>
                  <div className="al-pcard">
                    <div className="al-pcard-cover">
                      {previewCover
                        ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={previewCover} alt="" />
                        : <div className="ph"><i className="fas fa-image" /></div>}
                      <div className="al-pcard-grad" />
                      <span className="al-pcard-sub" style={{ background: `${sm.color}26`, color: sm.color, border: `1px solid ${sm.color}66` }}>
                        <i className={`fas ${sm.icon}`} /> {sm.label}
                      </span>
                    </div>
                    <div className="al-pcard-body">
                      <div className="al-pcard-title">{form.title || 'اسم الأليرت'}</div>
                      <div className="al-pcard-stars">{'★'.repeat(form.rating)}{'☆'.repeat(5 - form.rating)}</div>
                      <div className="al-pcard-price">{previewPrice}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '.68rem', color: 'rgba(180,168,215,.4)', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
                    {imgCount} صورة · {vidCount} فيديو
                  </p>
                </div>

                {/* Form */}
                <div className="al-form">
                  {/* Basics */}
                  <div className="al-sec">
                    <div className="al-sec-label"><Bell size={13} /> الأساسيات</div>
                    <input className="al-input" placeholder="اسم الأليرت" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ marginBottom: 10 }} />
                    <input className="al-input" placeholder="عنوان فرعي / وصف قصير" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ marginBottom: 10 }} />
                    <div className="al-row2">
                      <div className="al-field">
                        <label className="al-fl">السعر (EGP)</label>
                        <input className="al-input" type="number" min="0" step="0.01" placeholder="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                      </div>
                      <div className="al-field">
                        <label className="al-fl">نص السعر (اختياري)</label>
                        <input className="al-input" placeholder="مثال: 5$ أو مجاني" value={form.priceLabel} onChange={e => setForm(f => ({ ...f, priceLabel: e.target.value }))} />
                      </div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <label className="al-fl">التقييم</label>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <button key={n} type="button" className="al-btn" onClick={() => setForm(f => ({ ...f, rating: n }))}
                            style={{ background: 'none', color: n <= form.rating ? '#F0830B' : 'rgba(180,168,215,.3)', fontSize: '1.3rem', lineHeight: 1 }}>★</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="al-sec">
                    <div className="al-sec-label"><i className="fas fa-layer-group" style={{ fontSize: 12 }} /> القسم</div>
                    <div className="al-subs">
                      {SUBS.map(s => {
                        const on = form.subCategory === s.value;
                        return (
                          <button key={s.value} type="button" className="al-btn al-subpill" onClick={() => setForm(f => ({ ...f, subCategory: s.value }))}
                            style={on ? { background: `${s.color}22`, borderColor: `${s.color}99`, color: s.color } : undefined}>
                            <i className={`fas ${s.icon}`} style={{ color: s.color }} /> {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="al-sec">
                    <div className="al-sec-label"><Tag size={13} /> الوسوم</div>
                    {form.tags.length > 0 && (
                      <div className="al-tags">
                        {form.tags.map(t => (
                          <span key={t} className="al-tag">{t}<button type="button" onClick={() => removeTag(t)}><X size={11} /></button></span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input className="al-input" placeholder="أضف وسم واضغط Enter" value={newTag}
                        onChange={e => setNewTag(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} style={{ flex: 1 }} />
                      <button type="button" className="al-btn al-up" onClick={addTag}><Plus size={13} /> أضف</button>
                    </div>
                  </div>

                  {/* Cover */}
                  <div className="al-sec">
                    <div className="al-sec-label"><ImagePlus size={13} /> صورة الغلاف</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <button type="button" className="al-btn al-up" onClick={() => coverRef.current?.click()} disabled={uploading === 'cover'}>
                        <Upload size={14} /> {uploading === 'cover' ? 'جاري الرفع...' : 'رفع الغلاف'}
                      </button>
                      {form.imageUrl && (
                        <div style={{ position: 'relative', width: 68, height: 48, borderRadius: 9, overflow: 'hidden', border: '1px solid rgba(84,22,181,.3)' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={form.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button type="button" className="al-btn" onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                            style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: 'rgba(0,0,0,.8)', color: '#fff', fontSize: '.55rem', border: 'none' }}>✕</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Media */}
                  <div className="al-sec">
                    <div className="al-sec-label"><Video size={13} /> الصور والفيديوهات ({form.media.length})</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button type="button" className="al-btn al-up" onClick={() => imgRef.current?.click()} disabled={uploading === 'img'}>
                        <ImagePlus size={14} /> {uploading === 'img' ? 'جاري الرفع...' : `صور (${imgCount})`}
                      </button>
                      <button type="button" className="al-btn al-up" onClick={() => videoRef.current?.click()} disabled={uploading === 'video'}>
                        <Video size={14} /> {uploading === 'video' ? 'جاري الرفع...' : `فيديو من الجهاز (${vidCount})`}
                      </button>
                    </div>
                    {uploadErr && <p style={{ marginTop: 8, fontSize: '.72rem', color: '#f87171' }}>{uploadErr}</p>}

                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <input className="al-input" placeholder="رابط يوتيوب..." dir="ltr" value={newVideoUrl}
                        onChange={e => setNewVideoUrl(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addVideoLink(); } }} style={{ flex: 1 }} />
                      <button type="button" className="al-btn al-up" onClick={addVideoLink} disabled={!isYouTubeUrl(newVideoUrl)}><Video size={13} /> يوتيوب</button>
                    </div>

                    {form.media.length > 0 && (
                      <div className="al-media-grid">
                        {form.media.map(item => (
                          <div key={item.id} className="al-media">
                            {item.type === 'image'
                              ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={item.url} alt="" />
                              : videoPoster(item.url)
                                ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={videoPoster(item.url)!} alt="" />
                                : <div className="al-media-vid"><Video size={18} style={{ color: 'rgba(155,89,208,.6)' }} /></div>}
                            <span className="al-media-type" style={{ background: item.type === 'image' ? 'rgba(84,22,181,.85)' : 'rgba(58,161,161,.85)' }}>{item.type === 'image' ? 'IMG' : 'VID'}</span>
                            <button type="button" className="al-media-del" onClick={() => removeMedia(item.id)}><X size={10} /></button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reorder */}
                    {form.media.length > 0 && (
                      <div style={{ marginTop: 12, border: '1px solid rgba(84,22,181,.25)', borderRadius: 13, overflow: 'hidden' }}>
                        <button type="button" className="al-btn" onClick={() => setShowReorder(v => !v)}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.85rem 1.1rem', background: showReorder ? 'rgba(84,22,181,.12)' : 'rgba(84,22,181,.06)', color: 'rgba(155,89,208,.85)', fontWeight: 700, fontSize: '.85rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><GripVertical size={14} /> ترتيب الصور والفيديوهات</span>
                          <motion.div animate={{ rotate: showReorder ? 180 : 0 }}><ChevronDown size={15} /></motion.div>
                        </button>
                        <AnimatePresence>
                          {showReorder && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                              <div style={{ padding: '.9rem 1.1rem' }}>
                                <Reorder.Group axis="y" values={form.media} onReorder={media => setForm(f => ({ ...f, media }))}>
                                  {form.media.map((item, idx) => (
                                    <Reorder.Item key={item.id} value={item}>
                                      <div className="al-reorder-row">
                                        <GripVertical size={15} style={{ color: 'rgba(84,22,181,.4)', flexShrink: 0 }} />
                                        {item.type === 'image'
                                          ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={item.url} alt="" className="al-reorder-thumb" />
                                          : videoPoster(item.url)
                                            ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={videoPoster(item.url)!} alt="" className="al-reorder-thumb" />
                                            : <div style={{ width: 42, height: 30, borderRadius: 6, background: 'rgba(58,161,161,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Video size={13} style={{ color: 'rgba(58,161,161,.7)' }} /></div>}
                                        <span style={{ fontSize: '.68rem', color: 'rgba(155,89,208,.5)', fontWeight: 700 }}>#{idx + 1}</span>
                                        <span className="al-reorder-url">{item.url.split('/').pop()}</span>
                                        <button type="button" className="al-btn" onClick={() => removeMedia(item.id)} style={{ width: 21, height: 21, borderRadius: '50%', background: 'rgba(220,50,50,.1)', border: '1px solid rgba(220,50,50,.2)', color: 'rgba(220,100,100,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><X size={10} /></button>
                                      </div>
                                    </Reorder.Item>
                                  ))}
                                </Reorder.Group>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="al-sec">
                    <div className="al-sec-label"><i className="fas fa-toggle-on" style={{ fontSize: 12 }} /> الحالة</div>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      {[{ key: 'featured', label: 'مميز ⭐', color: '#FFD700' }, { key: 'active', label: 'نشط', color: '#3AA1A1' }].map(t => (
                        <label key={t.key} className="al-toggle">
                          <div className="al-toggle-box" style={{ background: form[t.key as keyof FormState] ? t.color : 'rgba(255,255,255,.1)' }}
                            onClick={() => setForm(f => ({ ...f, [t.key]: !f[t.key as keyof FormState] }))}>
                            <div className="al-toggle-thumb" style={{ left: form[t.key as keyof FormState] ? 22 : 3 }} />
                          </div>
                          <span style={{ fontSize: '.85rem', color: 'rgba(200,190,230,.7)', fontWeight: 600 }}>{t.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="al-actions">
                    <button className="al-btn al-save" onClick={save} disabled={saving || !form.title.trim()}
                      style={{ background: saving || !form.title.trim() ? 'rgba(84,22,181,.3)' : 'linear-gradient(135deg,#5416B5,#7F3AA1)', cursor: saving || !form.title.trim() ? 'not-allowed' : 'pointer' }}>
                      {saving ? 'جاري الحفظ...' : (editId ? 'حفظ التعديلات' : 'إضافة الأليرت')}
                    </button>
                    <button className="al-btn al-cancel" onClick={closeModal}>إلغاء</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useState, useRef, useMemo } from 'react';
import { Reorder, motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, X, Upload, GripVertical,
  ImagePlus, Video, ChevronDown, Box, Sparkles,
} from 'lucide-react';
import { isYouTubeUrl } from '@/lib/youtube';
import { mediaKind, videoPoster } from '@/lib/media';
import { uploadVideoDirect } from '@/lib/uploadClient';

/* ── 3D categories (color-coded) ───────────────────────────── */
const CATS = [
  { value: 'logo3d',   label: 'شعارات 3D',        color: '#B57BEA', icon: 'fa-cube' },
  { value: 'intro3d',  label: 'إنترو 3D',         color: '#5EC8F0', icon: 'fa-film' },
  { value: 'particle', label: 'تأثيرات الجزيئات', color: '#F5C542', icon: 'fa-star' },
  { value: 'hologram', label: 'هولوغرام',          color: '#4FE3B8', icon: 'fa-ghost' },
  { value: 'text3d',   label: 'نصوص 3D',           color: '#FF6FA5', icon: 'fa-font' },
  { value: 'scene3d',  label: 'مشاهد كاملة',       color: '#FF8A3D', icon: 'fa-mountain' },
];
const catMeta = (v?: string | null) => CATS.find(c => c.value === v) ?? { value: v ?? '', label: v ?? '—', color: '#9B59D0', icon: 'fa-cube' };
const BADGE_PRESETS = ['الأكثر طلباً', 'جديد', 'حصري', 'مميز'];

/* ── Types ─────────────────────────────────────────────────── */
type MediaType = 'image' | 'video';
interface MediaItem { id: string; url: string; type: MediaType; }

interface TDItem {
  id: string; title: string; description: string; subCategory: string | null;
  imageUrl: string; images: string[]; videos: string[]; tags: string[];
  featured: boolean; active: boolean;
}
interface FormState {
  name: string; desc: string; cat: string; badge: string;
  imageUrl: string; media: MediaItem[]; featured: boolean; active: boolean;
}

const uid = () => Math.random().toString(36).slice(2);
const empty = (): FormState => ({ name: '', desc: '', cat: 'logo3d', badge: '', imageUrl: '', media: [], featured: false, active: true });

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload failed');
  return (await res.json()).url;
}

/* ── Component ─────────────────────────────────────────────── */
export function ThreeDAdminClient({ items: init }: { items: TDItem[] }) {
  const [items, setItems]     = useState<TDItem[]>(init);
  const [filter, setFilter]   = useState('all');
  const [modal, setModal]     = useState(false);
  const [editId, setEditId]   = useState<string | null>(null);
  const [form, setForm]       = useState<FormState>(empty());
  const [showReorder, setShowReorder] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState<'cover' | 'img' | 'video' | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [uploadErr, setUploadErr] = useState('');

  const coverRef = useRef<HTMLInputElement>(null);
  const imgRef   = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const shown = useMemo(() => filter === 'all' ? items : items.filter(i => i.subCategory === filter), [items, filter]);

  function openAdd() { setEditId(null); setForm(empty()); setShowReorder(false); setNewVideoUrl(''); setUploadErr(''); setModal(true); }
  function openEdit(it: TDItem) {
    setEditId(it.id);
    const media: MediaItem[] = (it.images ?? []).map(u => ({ id: uid(), url: u, type: mediaKind(u) === 'image' ? 'image' : 'video' }));
    setForm({ name: it.title, desc: it.description ?? '', cat: it.subCategory ?? 'logo3d', badge: it.tags?.[0] ?? '', imageUrl: it.imageUrl, media, featured: it.featured, active: it.active });
    setShowReorder(false); setNewVideoUrl(''); setUploadErr(''); setModal(true);
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
    try { const url = await uploadVideoDirect(file); setForm(f => ({ ...f, media: [...f.media, { id: uid(), url, type: 'video' as const }] })); }
    catch (err: any) { setUploadErr(err?.message ?? 'فشل رفع الفيديو'); }
    finally { setUploading(null); e.target.value = ''; }
  }
  function addVideoLink() {
    const url = newVideoUrl.trim();
    if (!url || !isYouTubeUrl(url)) return;
    setForm(f => ({ ...f, media: [...f.media, { id: uid(), url, type: 'video' as const }] }));
    setNewVideoUrl('');
  }
  function removeMedia(id: string) { setForm(f => ({ ...f, media: f.media.filter(m => m.id !== id) })); }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    const orderedUrls = form.media.map(m => m.url);
    const videoUrls   = form.media.filter(m => m.type === 'video').map(m => m.url);
    const body = {
      title: form.name.trim(),
      description: form.desc.trim() || form.name.trim(),
      price: 0,
      category: 'THREE_D', subCategory: form.cat,
      imageUrl: form.imageUrl || orderedUrls.find(u => mediaKind(u) === 'image') || '',
      images: orderedUrls,
      videos: videoUrls,
      videoUrl: videoUrls[0] ?? null,
      tags: form.badge.trim() ? [form.badge.trim()] : [],
      featured: form.featured, active: form.active,
    };
    try {
      if (editId) {
        const res = await fetch(`/api/products/${editId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const updated = await res.json().catch(() => null);
        setItems(list => list.map(i => i.id === editId ? ({ ...i, ...(updated ?? body), id: editId } as TDItem) : i));
      } else {
        const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const created = await res.json();
        setItems(list => [{ ...body, id: created.id } as TDItem, ...list]);
      }
      closeModal();
    } finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm('حذف هذا التأثير نهائياً؟')) return;
    setDeleting(id);
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setItems(list => list.filter(i => i.id !== id));
    setDeleting(null);
  }

  const imgCount = form.media.filter(m => m.type === 'image').length;
  const vidCount = form.media.filter(m => m.type === 'video').length;
  const previewCover = form.imageUrl || form.media.find(m => m.type === 'image')?.url || '';
  const cm = catMeta(form.cat);

  return (
    <div className="t3-root" dir="rtl">
      <style>{`
        .t3-root { min-height:100vh; background:radial-gradient(1100px 550px at 15% -10%, rgba(84,22,181,.2), transparent 55%), radial-gradient(900px 500px at 100% 0%, rgba(58,161,161,.1), transparent 55%), linear-gradient(180deg,#0F083B,#0C0516); padding:2rem 1.5rem 4rem; font-family:'Cairo','29LtBukra','Montserrat',sans-serif; color:#e8e4f8; }
        .t3-wrap { max-width:1220px; margin:0 auto; }
        .t3-btn { border:none; cursor:pointer; font-family:inherit; transition:all .2s; }

        .t3-head { display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:1.8rem; }
        .t3-head-l { display:flex; align-items:center; gap:16px; }
        .t3-badge { width:58px; height:58px; border-radius:18px; display:flex; align-items:center; justify-content:center; flex-shrink:0; position:relative;
          background:linear-gradient(140deg,#7F3AA1,#5416B5); box-shadow:0 12px 32px rgba(84,22,181,.55), inset 0 1px 0 rgba(255,255,255,.28); color:#fff; }
        .t3-badge::after { content:''; position:absolute; inset:-2px; border-radius:20px; padding:2px; background:linear-gradient(140deg,rgba(155,89,208,.6),transparent); -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask-composite:exclude; }
        .t3-title { font-family:'Oxanium',sans-serif; font-weight:900; font-size:clamp(1.5rem,3vw,2.2rem); margin:0; line-height:1.1;
          background:linear-gradient(120deg,#fff,#c8a4f0 55%,#5EC8F0); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
        .t3-sub { color:rgba(180,168,215,.6); font-size:.85rem; margin-top:3px; }
        .t3-add { display:flex; align-items:center; gap:9px; padding:.8rem 1.6rem; border-radius:50px; color:#fff; font-weight:800; font-size:.9rem; background:linear-gradient(135deg,#5416B5,#7F3AA1); box-shadow:0 8px 24px rgba(84,22,181,.45); }
        .t3-add:hover { transform:translateY(-2px); box-shadow:0 12px 30px rgba(84,22,181,.6); }

        .t3-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:1.6rem; }
        @media(max-width:720px){ .t3-stats{ grid-template-columns:repeat(2,1fr); } }
        .t3-stat { background:rgba(20,10,48,.55); border:1px solid rgba(84,22,181,.2); border-radius:16px; padding:1.1rem 1.2rem; backdrop-filter:blur(8px); }
        .t3-stat-n { font-family:'Oxanium',sans-serif; font-weight:800; font-size:1.7rem; color:#c8a4f0; line-height:1; }
        .t3-stat-l { font-size:.74rem; color:rgba(180,168,215,.55); margin-top:6px; }

        .t3-filters { display:flex; gap:9px; flex-wrap:wrap; margin-bottom:1.6rem; }
        .t3-pill { display:inline-flex; align-items:center; gap:7px; padding:.5rem 1rem; border-radius:50px; cursor:pointer; font-size:.82rem; font-weight:700; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); color:rgba(200,190,225,.7); transition:all .2s; }
        .t3-pill:hover { color:#e8e4f8; }
        .t3-pill .cnt { font-size:.66rem; opacity:.8; background:rgba(0,0,0,.28); padding:1px 7px; border-radius:20px; }

        .t3-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:1.1rem; }
        .t3-card { position:relative; border-radius:18px; overflow:hidden; background:rgba(15,8,59,.55); border:1px solid rgba(84,22,181,.2); box-shadow:0 8px 26px rgba(0,0,0,.35); transition:transform .28s cubic-bezier(.25,.8,.25,1), border-color .28s, box-shadow .28s; }
        .t3-card:hover { transform:translateY(-6px); border-color:rgba(155,89,208,.5); box-shadow:0 16px 40px rgba(84,22,181,.28); }
        .t3-card-cover { position:relative; width:100%; height:155px; overflow:hidden; background:#0a0420; }
        .t3-card-cover img { width:100%; height:100%; object-fit:cover; transition:transform .5s; }
        .t3-card:hover .t3-card-cover img { transform:scale(1.07); }
        .t3-card-grad { position:absolute; inset:0; background:linear-gradient(to top,rgba(8,3,20,.95),rgba(8,3,20,.1) 55%,transparent); }
        .t3-card-cat { position:absolute; top:10px; right:10px; display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:50px; font-size:.62rem; font-weight:800; backdrop-filter:blur(8px); }
        .t3-card-badge { position:absolute; top:10px; left:10px; padding:3px 10px; border-radius:50px; font-size:.6rem; font-weight:800; background:linear-gradient(135deg,#5416B5,#7F3AA1); color:#fff; }
        .t3-card-body { padding:12px 14px 14px; }
        .t3-card-title { font-weight:800; font-size:.95rem; color:#f0ecff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .t3-card-desc { font-size:.72rem; color:rgba(180,168,215,.5); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .t3-card-row { display:flex; align-items:center; justify-content:space-between; margin-top:10px; }
        .t3-card-meta { font-size:.66rem; color:rgba(155,89,208,.6); display:flex; gap:9px; }
        .t3-hidden { font-size:.6rem; font-weight:700; padding:2px 8px; border-radius:20px; background:rgba(255,80,80,.14); color:#ff9a9a; }
        .t3-card-actions { display:flex; gap:7px; margin-top:12px; }
        .t3-card-edit { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:.5rem; border-radius:10px; font-size:.78rem; font-weight:700; background:rgba(84,22,181,.16); border:1px solid rgba(84,22,181,.32); color:#c4a0e0; }
        .t3-card-edit:hover { background:rgba(84,22,181,.3); color:#fff; }
        .t3-card-del { padding:.5rem .75rem; border-radius:10px; background:rgba(220,50,50,.1); border:1px solid rgba(220,50,50,.25); color:rgba(230,120,120,.85); }
        .t3-card-del:hover { background:rgba(220,50,50,.2); }
        .t3-empty { text-align:center; padding:70px 20px; color:rgba(155,89,208,.4); }
        .t3-empty i { font-size:3rem; display:block; margin-bottom:14px; opacity:.5; }

        .t3-modal-bg { position:fixed; inset:0; z-index:500; background:rgba(4,1,12,.72); backdrop-filter:blur(6px); display:flex; align-items:flex-start; justify-content:center; overflow-y:auto; padding:2rem 1rem; }
        .t3-modal { width:100%; max-width:920px; background:linear-gradient(180deg,#0d0620,#0a0514); border:1px solid rgba(84,22,181,.35); border-radius:22px; overflow:hidden; box-shadow:0 30px 90px rgba(0,0,0,.85); }
        .t3-modal-head { display:flex; align-items:center; justify-content:space-between; padding:1.2rem 1.6rem; border-bottom:1px solid rgba(84,22,181,.2); background:rgba(84,22,181,.06); }
        .t3-modal-head h2 { font-family:'Oxanium',sans-serif; font-weight:800; font-size:1.05rem; color:#f0ecff; margin:0; }
        .t3-modal-head .x { width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); color:rgba(200,185,230,.7); display:flex; align-items:center; justify-content:center; }
        .t3-modal-body { display:grid; grid-template-columns:1fr 310px; }
        @media(max-width:820px){ .t3-modal-body{ grid-template-columns:1fr; } .t3-preview-pane{ display:none; } }
        .t3-form { padding:1.5rem 1.6rem; }
        .t3-sec { margin-bottom:1.5rem; }
        .t3-sec-label { display:flex; align-items:center; gap:8px; font-size:.7rem; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:rgba(155,89,208,.7); margin-bottom:.8rem; }
        .t3-input { width:100%; padding:.7rem 1rem; border-radius:11px; background:rgba(255,255,255,.04); border:1px solid rgba(84,22,181,.3); color:#f0ecff; font-size:.9rem; font-family:inherit; outline:none; box-sizing:border-box; }
        .t3-input:focus { border-color:#7F3AA1; background:rgba(84,22,181,.08); }
        .t3-input::placeholder { color:rgba(180,170,210,.35); }
        .t3-cats { display:flex; gap:9px; flex-wrap:wrap; }
        .t3-catpill { display:inline-flex; align-items:center; gap:8px; padding:.55rem 1rem; border-radius:12px; cursor:pointer; font-size:.82rem; font-weight:700; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); color:rgba(200,190,225,.65); transition:all .2s; }
        .t3-catpill:hover { color:#f0ecff; }
        .t3-badges { display:flex; gap:7px; flex-wrap:wrap; margin-top:.6rem; }
        .t3-badge-chip { padding:.3rem .8rem; border-radius:8px; font-size:.72rem; font-weight:700; cursor:pointer; background:rgba(84,22,181,.1); border:1px solid rgba(155,89,208,.25); color:rgba(200,190,225,.7); }
        .t3-badge-chip.on { background:linear-gradient(135deg,#5416B5,#7F3AA1); color:#fff; border-color:transparent; }
        .t3-up { display:inline-flex; align-items:center; gap:8px; padding:.6rem 1.15rem; border-radius:11px; border:1px dashed rgba(84,22,181,.5); background:rgba(84,22,181,.07); color:rgba(180,150,220,.85); font-size:.82rem; font-weight:700; cursor:pointer; transition:all .2s; }
        .t3-up:hover { border-color:#7F3AA1; background:rgba(84,22,181,.14); color:#d4b8f0; }
        .t3-media-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(70px,1fr)); gap:8px; margin-top:.8rem; }
        .t3-media { position:relative; border-radius:9px; overflow:hidden; aspect-ratio:1; background:rgba(84,22,181,.08); }
        .t3-media img { width:100%; height:100%; object-fit:cover; }
        .t3-media-vid { width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(58,161,161,.12); }
        .t3-media-type { position:absolute; bottom:3px; left:3px; font-size:.5rem; font-weight:800; padding:1px 5px; border-radius:4px; color:#fff; }
        .t3-media-del { position:absolute; top:3px; right:3px; width:19px; height:19px; border-radius:50%; background:rgba(0,0,0,.75); border:none; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .2s; }
        .t3-media:hover .t3-media-del { opacity:1; }
        .t3-reorder-row { display:flex; align-items:center; gap:10px; padding:.6rem .85rem; border-radius:10px; background:rgba(255,255,255,.03); border:1px solid rgba(84,22,181,.15); margin-bottom:6px; cursor:grab; }
        .t3-reorder-row:active { cursor:grabbing; background:rgba(84,22,181,.1); }
        .t3-reorder-thumb { width:42px; height:30px; border-radius:6px; object-fit:cover; flex-shrink:0; }
        .t3-reorder-url { flex:1; font-size:.68rem; color:rgba(170,155,200,.5); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; direction:ltr; }
        .t3-toggle { display:flex; align-items:center; gap:10px; cursor:pointer; user-select:none; }
        .t3-toggle-box { width:42px; height:23px; border-radius:12px; position:relative; transition:background .2s; }
        .t3-toggle-thumb { position:absolute; top:3px; width:17px; height:17px; border-radius:50%; background:#fff; transition:left .2s; }

        .t3-preview-pane { border-right:1px solid rgba(84,22,181,.18); padding:1.5rem 1.3rem; background:rgba(84,22,181,.04); }
        .t3-preview-label { font-size:.66rem; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:rgba(155,89,208,.55); margin-bottom:1rem; text-align:center; }
        .t3-pcard { border-radius:16px; overflow:hidden; background:rgba(15,8,59,.7); border:1px solid rgba(84,22,181,.28); box-shadow:0 12px 34px rgba(0,0,0,.4); }
        .t3-pcard-cover { position:relative; width:100%; height:150px; background:#0a0420; }
        .t3-pcard-cover img { width:100%; height:100%; object-fit:cover; }
        .t3-pcard-cover .ph { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:rgba(155,89,208,.3); font-size:2rem; }
        .t3-pcard-grad { position:absolute; inset:0; background:linear-gradient(180deg,transparent 40%,rgba(12,5,22,.92)); }
        .t3-pcard-cat { position:absolute; top:9px; right:9px; padding:3px 9px; border-radius:50px; font-size:.58rem; font-weight:800; backdrop-filter:blur(8px); }
        .t3-pcard-badge { position:absolute; top:9px; left:9px; padding:3px 9px; border-radius:50px; font-size:.58rem; font-weight:800; background:linear-gradient(135deg,#5416B5,#7F3AA1); color:#fff; }
        .t3-pcard-body { padding:12px 14px 15px; }
        .t3-pcard-title { font-weight:800; font-size:1rem; color:#f0ecff; }
        .t3-pcard-desc { font-size:.74rem; color:rgba(180,168,215,.5); margin-top:3px; line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .t3-pcard-foot { display:flex; align-items:center; justify-content:space-between; margin-top:10px; }
        .t3-pcard-foot .prev { font-size:.72rem; color:#9B59D0; }
        .t3-pcard-foot .cnt { font-size:.68rem; color:rgba(255,255,255,.35); }

        .t3-actions { display:flex; gap:10px; padding-top:.3rem; }
        .t3-save { flex:1; padding:.85rem; border-radius:12px; color:#fff; font-weight:800; font-size:.95rem; box-shadow:0 6px 20px rgba(84,22,181,.35); }
        .t3-cancel { padding:.85rem 1.4rem; border-radius:12px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); color:rgba(200,185,230,.6); font-weight:700; }
      `}</style>

      <div className="t3-wrap">
        {/* Header */}
        <div className="t3-head">
          <div className="t3-head-l">
            <div className="t3-badge"><Box size={28} /></div>
            <div>
              <h1 className="t3-title">إدارة تأثيرات 3D</h1>
              <p className="t3-sub">أضف تأثير، ارفع صور وفيديوهات، رتّبها، وخصّص القسم والشارة</p>
            </div>
          </div>
          <button className="t3-btn t3-add" onClick={openAdd}><Plus size={17} /> تأثير جديد</button>
        </div>

        {/* Stats */}
        <div className="t3-stats">
          {[
            { n: items.length, l: 'إجمالي التأثيرات' },
            { n: items.filter(i => i.active).length, l: 'نشط' },
            { n: items.filter(i => i.featured).length, l: 'مميز' },
            { n: new Set(items.map(i => i.subCategory)).size, l: 'أقسام مستخدمة' },
          ].map(s => (
            <div key={s.l} className="t3-stat"><div className="t3-stat-n">{s.n}</div><div className="t3-stat-l">{s.l}</div></div>
          ))}
        </div>

        {/* Filters */}
        <div className="t3-filters">
          <button className="t3-btn t3-pill" onClick={() => setFilter('all')}
            style={filter === 'all' ? { background: 'rgba(155,89,208,.22)', borderColor: 'rgba(155,89,208,.55)', color: '#c8a4f0' } : undefined}>
            <i className="fas fa-th" /> الكل <span className="cnt">{items.length}</span>
          </button>
          {CATS.map(c => {
            const cnt = items.filter(i => i.subCategory === c.value).length;
            const on = filter === c.value;
            return (
              <button key={c.value} className="t3-btn t3-pill" onClick={() => setFilter(c.value)}
                style={on ? { background: `${c.color}22`, borderColor: `${c.color}88`, color: c.color } : undefined}>
                <i className={`fas ${c.icon}`} style={{ color: c.color }} /> {c.label} <span className="cnt">{cnt}</span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {shown.length === 0 ? (
          <div className="t3-empty"><i className="fas fa-cube" /><p>لا توجد تأثيرات في هذا القسم — ابدأ بإضافة أول تأثير</p></div>
        ) : (
          <div className="t3-grid">
            {shown.map(it => {
              const m = catMeta(it.subCategory);
              const imgC = (it.images ?? []).filter(u => mediaKind(u) === 'image').length;
              const vidC = (it.images ?? []).filter(u => mediaKind(u) !== 'image').length;
              return (
                <div key={it.id} className="t3-card">
                  <div className="t3-card-cover">
                    {it.imageUrl
                      ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={it.imageUrl} alt={it.title} />
                      : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(155,89,208,.3)' }}><ImagePlus size={30} /></div>}
                    <div className="t3-card-grad" />
                    <span className="t3-card-cat" style={{ background: `${m.color}26`, color: m.color, border: `1px solid ${m.color}66` }}>
                      <i className={`fas ${m.icon}`} /> {m.label}
                    </span>
                    {it.tags?.[0] && <span className="t3-card-badge">{it.tags[0]}</span>}
                  </div>
                  <div className="t3-card-body">
                    <div className="t3-card-title">{it.title}</div>
                    <div className="t3-card-desc">{it.description}</div>
                    <div className="t3-card-row">
                      <span className="t3-card-meta"><span>🖼 {imgC}</span><span>🎬 {vidC}</span></span>
                      {!it.active && <span className="t3-hidden">مخفي</span>}
                    </div>
                    <div className="t3-card-actions">
                      <button className="t3-btn t3-card-edit" onClick={() => openEdit(it)}><Edit2 size={13} /> تعديل</button>
                      <button className="t3-btn t3-card-del" onClick={() => del(it.id)} disabled={deleting === it.id}>
                        {deleting === it.id ? '...' : <Trash2 size={14} />}
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
          <motion.div className="t3-modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
            <motion.div className="t3-modal" initial={{ scale: .96, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: .96, opacity: 0 }}
              onClick={e => e.stopPropagation()}>
              <div className="t3-modal-head">
                <h2>{editId ? 'تعديل التأثير' : 'تأثير 3D جديد'}</h2>
                <button className="t3-btn x" onClick={closeModal}><X size={15} /></button>
              </div>

              <div className="t3-modal-body">
                {/* Live preview */}
                <div className="t3-preview-pane">
                  <div className="t3-preview-label">معاينة كارت الموقع</div>
                  <div className="t3-pcard">
                    <div className="t3-pcard-cover">
                      {previewCover
                        ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={previewCover} alt="" />
                        : <div className="ph"><i className="fas fa-cube" /></div>}
                      <div className="t3-pcard-grad" />
                      <span className="t3-pcard-cat" style={{ background: `${cm.color}26`, color: cm.color, border: `1px solid ${cm.color}66` }}>
                        <i className={`fas ${cm.icon}`} /> {cm.label}
                      </span>
                      {form.badge.trim() && <span className="t3-pcard-badge">{form.badge}</span>}
                    </div>
                    <div className="t3-pcard-body">
                      <div className="t3-pcard-title">{form.name || 'اسم التأثير'}</div>
                      <div className="t3-pcard-desc">{form.desc || 'وصف التأثير يظهر هنا...'}</div>
                      <div className="t3-pcard-foot">
                        <span className="prev"><i className="fas fa-images" /> معاينة</span>
                        <span className="cnt">{form.media.length} عنصر</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '.68rem', color: 'rgba(180,168,215,.4)', textAlign: 'center', marginTop: 12 }}>
                    {imgCount} صورة · {vidCount} فيديو
                  </p>
                </div>

                {/* Form */}
                <div className="t3-form">
                  <div className="t3-sec">
                    <div className="t3-sec-label"><Sparkles size={13} /> الأساسيات</div>
                    <input className="t3-input" placeholder="اسم التأثير (مثال: Venom Logo 3D)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ marginBottom: 10 }} />
                    <textarea className="t3-input" rows={2} placeholder="وصف قصير للتأثير" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} style={{ resize: 'none' }} />
                  </div>

                  <div className="t3-sec">
                    <div className="t3-sec-label"><Box size={13} /> القسم</div>
                    <div className="t3-cats">
                      {CATS.map(c => {
                        const on = form.cat === c.value;
                        return (
                          <button key={c.value} type="button" className="t3-btn t3-catpill" onClick={() => setForm(f => ({ ...f, cat: c.value }))}
                            style={on ? { background: `${c.color}22`, borderColor: `${c.color}99`, color: c.color } : undefined}>
                            <i className={`fas ${c.icon}`} style={{ color: c.color }} /> {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="t3-sec">
                    <div className="t3-sec-label"><i className="fas fa-tag" style={{ fontSize: 11 }} /> الشارة (اختياري)</div>
                    <input className="t3-input" placeholder="مثال: الأكثر طلباً" value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} />
                    <div className="t3-badges">
                      {BADGE_PRESETS.map(b => (
                        <button key={b} type="button" className={`t3-btn t3-badge-chip${form.badge === b ? ' on' : ''}`}
                          onClick={() => setForm(f => ({ ...f, badge: f.badge === b ? '' : b }))}>{b}</button>
                      ))}
                    </div>
                  </div>

                  <div className="t3-sec">
                    <div className="t3-sec-label"><ImagePlus size={13} /> صورة الغلاف</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <button type="button" className="t3-btn t3-up" onClick={() => coverRef.current?.click()} disabled={uploading === 'cover'}>
                        <Upload size={14} /> {uploading === 'cover' ? 'جاري الرفع...' : 'رفع الغلاف'}
                      </button>
                      {form.imageUrl && (
                        <div style={{ position: 'relative', width: 68, height: 48, borderRadius: 9, overflow: 'hidden', border: '1px solid rgba(84,22,181,.3)' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={form.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button type="button" className="t3-btn" onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                            style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: 'rgba(0,0,0,.8)', color: '#fff', fontSize: '.55rem', border: 'none' }}>✕</button>
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: '.68rem', color: 'rgba(180,168,215,.4)', marginTop: 6 }}>لو سِبته فاضي، هياخد أول صورة تلقائياً.</p>
                  </div>

                  <div className="t3-sec">
                    <div className="t3-sec-label"><Video size={13} /> الصور والفيديوهات ({form.media.length})</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button type="button" className="t3-btn t3-up" onClick={() => imgRef.current?.click()} disabled={uploading === 'img'}>
                        <ImagePlus size={14} /> {uploading === 'img' ? 'جاري الرفع...' : `صور (${imgCount})`}
                      </button>
                      <button type="button" className="t3-btn t3-up" onClick={() => videoRef.current?.click()} disabled={uploading === 'video'}>
                        <Video size={14} /> {uploading === 'video' ? 'جاري الرفع...' : `فيديو من الجهاز (${vidCount})`}
                      </button>
                    </div>
                    {uploadErr && <p style={{ marginTop: 8, fontSize: '.72rem', color: '#f87171' }}>{uploadErr}</p>}
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <input className="t3-input" placeholder="رابط يوتيوب..." dir="ltr" value={newVideoUrl}
                        onChange={e => setNewVideoUrl(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addVideoLink(); } }} style={{ flex: 1 }} />
                      <button type="button" className="t3-btn t3-up" onClick={addVideoLink} disabled={!isYouTubeUrl(newVideoUrl)}><Video size={13} /> يوتيوب</button>
                    </div>

                    {form.media.length > 0 && (
                      <div className="t3-media-grid">
                        {form.media.map(item => (
                          <div key={item.id} className="t3-media">
                            {item.type === 'image'
                              ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={item.url} alt="" />
                              : videoPoster(item.url)
                                ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={videoPoster(item.url)!} alt="" />
                                : <div className="t3-media-vid"><Video size={18} style={{ color: 'rgba(155,89,208,.6)' }} /></div>}
                            <span className="t3-media-type" style={{ background: item.type === 'image' ? 'rgba(84,22,181,.85)' : 'rgba(58,161,161,.85)' }}>{item.type === 'image' ? 'IMG' : 'VID'}</span>
                            <button type="button" className="t3-media-del" onClick={() => removeMedia(item.id)}><X size={10} /></button>
                          </div>
                        ))}
                      </div>
                    )}

                    {form.media.length > 0 && (
                      <div style={{ marginTop: 12, border: '1px solid rgba(84,22,181,.25)', borderRadius: 13, overflow: 'hidden' }}>
                        <button type="button" className="t3-btn" onClick={() => setShowReorder(v => !v)}
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
                                      <div className="t3-reorder-row">
                                        <GripVertical size={15} style={{ color: 'rgba(84,22,181,.4)', flexShrink: 0 }} />
                                        {item.type === 'image'
                                          ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={item.url} alt="" className="t3-reorder-thumb" />
                                          : videoPoster(item.url)
                                            ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={videoPoster(item.url)!} alt="" className="t3-reorder-thumb" />
                                            : <div style={{ width: 42, height: 30, borderRadius: 6, background: 'rgba(58,161,161,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Video size={13} style={{ color: 'rgba(58,161,161,.7)' }} /></div>}
                                        <span style={{ fontSize: '.68rem', color: 'rgba(155,89,208,.5)', fontWeight: 700 }}>#{idx + 1}</span>
                                        <span className="t3-reorder-url">{item.url.split('/').pop()}</span>
                                        <button type="button" className="t3-btn" onClick={() => removeMedia(item.id)} style={{ width: 21, height: 21, borderRadius: '50%', background: 'rgba(220,50,50,.1)', border: '1px solid rgba(220,50,50,.2)', color: 'rgba(220,100,100,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><X size={10} /></button>
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

                  <div className="t3-sec">
                    <div className="t3-sec-label"><i className="fas fa-toggle-on" style={{ fontSize: 12 }} /> الحالة</div>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      {[{ key: 'featured', label: 'مميز ⭐', color: '#FFD700' }, { key: 'active', label: 'نشط', color: '#3AA1A1' }].map(t => (
                        <label key={t.key} className="t3-toggle">
                          <div className="t3-toggle-box" style={{ background: form[t.key as keyof FormState] ? t.color : 'rgba(255,255,255,.1)' }}
                            onClick={() => setForm(f => ({ ...f, [t.key]: !f[t.key as keyof FormState] }))}>
                            <div className="t3-toggle-thumb" style={{ left: form[t.key as keyof FormState] ? 22 : 3 }} />
                          </div>
                          <span style={{ fontSize: '.85rem', color: 'rgba(200,190,230,.7)', fontWeight: 600 }}>{t.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="t3-actions">
                    <button className="t3-btn t3-save" onClick={save} disabled={saving || !form.name.trim()}
                      style={{ background: saving || !form.name.trim() ? 'rgba(84,22,181,.3)' : 'linear-gradient(135deg,#5416B5,#7F3AA1)', cursor: saving || !form.name.trim() ? 'not-allowed' : 'pointer' }}>
                      {saving ? 'جاري الحفظ...' : (editId ? 'حفظ التعديلات' : 'إضافة التأثير')}
                    </button>
                    <button className="t3-btn t3-cancel" onClick={closeModal}>إلغاء</button>
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

'use client';

import { useState, useRef } from 'react';
import { Reorder, motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, X, Upload, GripVertical,
  ImagePlus, Video, ChevronDown, Star,
} from 'lucide-react';
import { isYouTubeUrl, youtubeThumbnail } from '@/lib/youtube';

/* ── Types ─────────────────────────────────────────────────── */
type MediaType = 'image' | 'video';
interface MediaItem { id: string; url: string; type: MediaType; }

interface PkgItem {
  id: string; title: string; imageUrl: string;
  images: string[]; videos: string[];
  featured: boolean; active: boolean;
}
interface FormState {
  title: string; imageUrl: string;
  media: MediaItem[];          // combined images + روابط يوتيوب بالترتيب
  featured: boolean; active: boolean;
}

const uid = () => Math.random().toString(36).slice(2);
const empty = (): FormState => ({ title:'', imageUrl:'', media:[], featured:false, active:true });

/* ── Upload helper ──────────────────────────────────────────── */
async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/admin/upload', { method:'POST', body:fd });
  if (!res.ok) throw new Error('Upload failed');
  return (await res.json()).url;
}

/* ── Component ─────────────────────────────────────────────── */
export default function PubgAdminClient({ packages: init }: { packages: PkgItem[] }) {
  const [packages, setPackages]   = useState<PkgItem[]>(init);
  const [modal, setModal]         = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [form, setForm]           = useState<FormState>(empty());
  const [showReorder, setShowReorder] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState<'cover'|'img'|null>(null);
  const [deleting, setDeleting]   = useState<string|null>(null);
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const coverRef = useRef<HTMLInputElement>(null);
  const imgRef   = useRef<HTMLInputElement>(null);

  function openAdd() { setEditId(null); setForm(empty()); setShowReorder(false); setNewVideoUrl(''); setModal(true); }

  function openEdit(p: PkgItem) {
    setEditId(p.id);
    // rebuild combined media list from images[] — نكتشف النوع من رابط يوتيوب
    const media: MediaItem[] = p.images.map(u => ({ id: uid(), url: u, type: isYouTubeUrl(u) ? 'video' : 'image' }));
    setForm({ title: p.title, imageUrl: p.imageUrl, media, featured: p.featured, active: p.active });
    setShowReorder(false); setNewVideoUrl(''); setModal(true);
  }

  function closeModal() { setModal(false); setEditId(null); }

  async function pickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading('cover');
    try { const url = await uploadFile(file); setForm(f => ({ ...f, imageUrl: url })); }
    finally { setUploading(null); e.target.value = ''; }
  }

  async function pickImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []); if (!files.length) return;
    setUploading('img');
    try {
      const urls = await Promise.all(files.map(uploadFile));
      setForm(f => ({ ...f, media: [...f.media, ...urls.map(u => ({ id: uid(), url: u, type: 'image' as const }))] }));
    } finally { setUploading(null); e.target.value = ''; }
  }

  function addVideoLink() {
    const url = newVideoUrl.trim();
    if (!url || !isYouTubeUrl(url)) return;
    setForm(f => ({ ...f, media: [...f.media, { id: uid(), url, type: 'video' as const }] }));
    setNewVideoUrl('');
  }

  function removeMedia(id: string) { setForm(f => ({ ...f, media: f.media.filter(m => m.id !== id) })); }

  async function save() {
    if (!form.title.trim()) return;
    setSaving(true);
    // images[] stores everything in order; videos[] stores only video URLs
    const orderedUrls = form.media.map(m => m.url);
    const videoUrls   = form.media.filter(m => m.type === 'video').map(m => m.url);
    const body = {
      title: form.title.trim(),
      description: form.title.trim(),
      price: 0, category: 'PACKAGE', subCategory: 'pubg',
      imageUrl: form.imageUrl,
      images: orderedUrls,
      videos: videoUrls,
      videoUrl: videoUrls[0] ?? null,
      featured: form.featured, active: form.active, tags: [],
    };
    try {
      if (editId) {
        await fetch(`/api/products/${editId}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
        setPackages(ps => ps.map(p => p.id === editId ? { ...p, ...body, id: editId } : p));
      } else {
        const res  = await fetch('/api/products', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
        const created = await res.json();
        setPackages(ps => [{ ...body, id: created.id }, ...ps]);
      }
      closeModal();
    } finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm('حذف الباكدج؟')) return;
    setDeleting(id);
    await fetch(`/api/products/${id}`, { method:'DELETE' });
    setPackages(ps => ps.filter(p => p.id !== id));
    setDeleting(null);
  }

  const imgCount = form.media.filter(m => m.type === 'image').length;
  const vidCount = form.media.filter(m => m.type === 'video').length;

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#0F083B,#0C0516)', padding:'2rem', fontFamily:"'Montserrat',sans-serif", direction:'rtl' }}>
      <style>{`
        .pa-btn { border:none; cursor:pointer; font-family:inherit; transition:all .2s; }
        .pa-input { width:100%; padding:.7rem 1rem; border-radius:10px; background:rgba(255,255,255,0.05); border:1px solid rgba(84,22,181,0.3); color:#e8e4f8; font-size:.9rem; font-family:inherit; outline:none; }
        .pa-input:focus { border-color:#7F3AA1; background:rgba(84,22,181,0.08); }
        .pa-input::placeholder { color:rgba(180,170,210,0.35); }
        .pa-upload-btn { display:inline-flex; align-items:center; gap:8px; padding:.6rem 1.2rem; border-radius:10px; border:1px dashed rgba(84,22,181,0.5); background:rgba(84,22,181,0.07); color:rgba(155,89,208,0.8); font-size:.82rem; font-weight:600; cursor:pointer; transition:all .2s; }
        .pa-upload-btn:hover { border-color:#7F3AA1; background:rgba(84,22,181,0.14); color:#c4a0e0; }
        .pa-section-label { font-size:.7rem; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:rgba(155,89,208,0.6); margin-bottom:.6rem; display:block; }
        .pa-toggle { display:flex; align-items:center; gap:10px; cursor:pointer; user-select:none; }
        .pa-toggle-box { width:40px; height:22px; border-radius:12px; position:relative; transition:background .2s; }
        .pa-toggle-thumb { position:absolute; top:3px; width:16px; height:16px; border-radius:50%; background:#fff; transition:left .2s; }
        .pa-reorder-row { display:flex; align-items:center; gap:10px; padding:.65rem .9rem; border-radius:10px; background:rgba(255,255,255,0.03); border:1px solid rgba(84,22,181,0.15); margin-bottom:6px; cursor:grab; user-select:none; }
        .pa-reorder-row:active { cursor:grabbing; background:rgba(84,22,181,0.1); }
        .pa-reorder-thumb { width:44px; height:32px; border-radius:6px; object-fit:cover; flex-shrink:0; }
        .pa-reorder-url { flex:1; font-size:.7rem; color:rgba(170,155,200,0.55); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; direction:ltr; }
        .pa-type-badge { font-size:.58rem; font-weight:700; letter-spacing:1px; text-transform:uppercase; padding:2px 7px; border-radius:8px; flex-shrink:0; }
        .pa-card { background:rgba(15,8,59,0.6); border:1px solid rgba(84,22,181,0.2); border-radius:14px; overflow:hidden; transition:all .25s; }
        .pa-card:hover { border-color:rgba(127,58,161,0.5); transform:translateY(-3px); box-shadow:0 8px 24px rgba(84,22,181,0.2); }
        .pa-card-cover { width:100%; height:160px; object-fit:cover; display:block; background:rgba(84,22,181,0.1); }
        .pa-card-body { padding:14px 16px; }
        .pa-card-title { font-size:.95rem; font-weight:700; color:#e8e4f8; margin-bottom:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .pa-card-meta { font-size:.72rem; color:rgba(155,89,208,0.6); display:flex; gap:12px; margin-bottom:12px; }
        .pa-card-actions { display:flex; gap:8px; }
        .pa-media-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(72px,1fr)); gap:8px; }
        .pa-media-item { position:relative; border-radius:8px; overflow:hidden; aspect-ratio:1; background:rgba(84,22,181,0.08); }
        .pa-media-item img { width:100%; height:100%; object-fit:cover; display:block; }
        .pa-media-item-video { width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(84,22,181,0.12); }
        .pa-media-del { position:absolute; top:4px; right:4px; width:20px; height:20px; border-radius:50%; background:rgba(0,0,0,0.75); border:none; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:.6rem; opacity:0; transition:opacity .2s; }
        .pa-media-item:hover .pa-media-del { opacity:1; }
        .pa-media-type { position:absolute; bottom:3px; left:3px; font-size:.52rem; font-weight:700; padding:1px 5px; border-radius:4px; }
      `}</style>

      {/* Page Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <div style={{ fontSize:'.65rem', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'rgba(155,89,208,0.6)', marginBottom:6 }}>PUBG Championship</div>
          <h1 style={{ fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:900, color:'#eae6ff', margin:0 }}>إدارة الباكدجات</h1>
        </div>
        <button className="pa-btn" onClick={openAdd} style={{ display:'flex', alignItems:'center', gap:8, padding:'.75rem 1.6rem', borderRadius:50, background:'linear-gradient(135deg,#5416B5,#7F3AA1)', color:'#fff', fontWeight:700, fontSize:'.9rem', boxShadow:'0 4px 16px rgba(84,22,181,0.4)' }}>
          <Plus size={16}/> إضافة باكدج
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:'1rem', marginBottom:'2rem', flexWrap:'wrap' }}>
        {[
          { label:'إجمالي الباكدجات', val: packages.length },
          { label:'نشط', val: packages.filter(p=>p.active).length },
          { label:'مميز', val: packages.filter(p=>p.featured).length },
        ].map(s=>(
          <div key={s.label} style={{ flex:1, minWidth:140, background:'rgba(15,8,59,0.6)', border:'1px solid rgba(84,22,181,0.2)', borderRadius:12, padding:'1rem 1.2rem', textAlign:'center' }}>
            <div style={{ fontFamily:"'Oxanium',sans-serif", fontSize:'1.6rem', fontWeight:800, color:'#9B59D0' }}>{s.val}</div>
            <div style={{ fontSize:'.72rem', color:'rgba(170,155,200,0.5)', letterSpacing:1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      {packages.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'rgba(155,89,208,0.3)' }}>
          <div style={{ fontSize:'3rem', marginBottom:12 }}>🏆</div>
          <p style={{ fontSize:'.9rem' }}>لا توجد باكدجات — ابدأ بإضافة أول باكدج</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'1.2rem' }}>
          {packages.map(p => {
            const imgC = p.images.filter(u => !isYouTubeUrl(u)).length;
            const vidC = p.images.filter(u =>  isYouTubeUrl(u)).length;
            return (
              <div key={p.id} className="pa-card">
                {p.imageUrl
                  ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.imageUrl} alt={p.title} className="pa-card-cover"/>
                  : <div className="pa-card-cover" style={{ display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(84,22,181,0.3)' }}><ImagePlus size={32}/></div>
                }
                <div className="pa-card-body">
                  <div className="pa-card-title">{p.title}</div>
                  <div className="pa-card-meta">
                    <span>🖼 {imgC} صورة</span>
                    <span>🎬 {vidC} فيديو</span>
                    {p.featured && <span style={{color:'#FFD700'}}>⭐</span>}
                    {!p.active && <span style={{color:'rgba(255,80,80,0.7)'}}>مخفي</span>}
                  </div>
                  <div className="pa-card-actions">
                    <button className="pa-btn" onClick={() => openEdit(p)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'.5rem', borderRadius:8, background:'rgba(84,22,181,0.15)', border:'1px solid rgba(84,22,181,0.3)', color:'#c4a0e0', fontSize:'.8rem', fontWeight:600 }}>
                      <Edit2 size={13}/> تعديل
                    </button>
                    <button className="pa-btn" onClick={() => del(p.id)} disabled={deleting === p.id} style={{ padding:'.5rem .8rem', borderRadius:8, background:'rgba(220,50,50,0.1)', border:'1px solid rgba(220,50,50,0.25)', color:'rgba(220,100,100,0.8)' }}>
                      {deleting === p.id ? '...' : <Trash2 size={14}/>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Hidden inputs */}
      <input ref={coverRef} type="file" accept="image/*"          style={{display:'none'}} onChange={pickCover}/>
      <input ref={imgRef}   type="file" accept="image/*" multiple style={{display:'none'}} onChange={pickImages}/>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'flex-start', justifyContent:'center', overflowY:'auto', padding:'2rem 1rem' }}
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div initial={{scale:.95,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}} exit={{scale:.95,opacity:0}}
              style={{ width:'100%', maxWidth:620, background:'#0a0514', border:'1px solid rgba(84,22,181,0.35)', borderRadius:20, overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,0.8)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.2rem 1.5rem', borderBottom:'1px solid rgba(84,22,181,0.2)', background:'rgba(84,22,181,0.06)' }}>
                <div>
                  <div style={{ fontSize:'.62rem', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'rgba(155,89,208,0.6)', marginBottom:4 }}>PUBG Championship</div>
                  <div style={{ fontWeight:800, color:'#eae6ff', fontSize:'1rem' }}>{editId ? 'تعديل الباكدج' : 'إضافة باكدج جديد'}</div>
                </div>
                <button className="pa-btn" onClick={closeModal} style={{ width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(200,185,230,0.7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <X size={15}/>
                </button>
              </div>

              <div style={{ padding:'1.5rem' }}>

                {/* Title */}
                <div style={{ marginBottom:'1.2rem' }}>
                  <span className="pa-section-label">اسم الباكدج</span>
                  <input className="pa-input" placeholder="مثال: باكدج وطن PUBG" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}/>
                </div>

                {/* Cover */}
                <div style={{ marginBottom:'1.4rem' }}>
                  <span className="pa-section-label">صورة الغلاف</span>
                  <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                    <button className="pa-upload-btn pa-btn" onClick={() => coverRef.current?.click()} disabled={uploading==='cover'}>
                      <Upload size={14}/>{uploading==='cover' ? 'جاري الرفع...' : 'رفع صورة الغلاف'}
                    </button>
                    {form.imageUrl && (
                      <div style={{ position:'relative', width:64, height:48, borderRadius:8, overflow:'hidden', border:'1px solid rgba(84,22,181,0.3)', flexShrink:0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.imageUrl} alt="cover" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                        <button className="pa-btn" onClick={()=>setForm(f=>({...f,imageUrl:''}))} style={{ position:'absolute', top:2, right:2, width:16, height:16, borderRadius:'50%', background:'rgba(0,0,0,0.8)', color:'#fff', fontSize:'.55rem', display:'flex', alignItems:'center', justifyContent:'center', border:'none' }}>✕</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* إضافة صور */}
                <div style={{ display:'flex', gap:10, marginBottom:'1rem', flexWrap:'wrap' }}>
                  <button className="pa-upload-btn pa-btn" onClick={() => imgRef.current?.click()} disabled={uploading==='img'}>
                    <ImagePlus size={14}/>{uploading==='img' ? 'جاري الرفع...' : `إضافة صور (${imgCount})`}
                  </button>
                </div>

                {/* إضافة رابط فيديو يوتيوب */}
                <div style={{ marginBottom:'1rem' }}>
                  <span className="pa-section-label">إضافة فيديو يوتيوب ({vidCount})</span>
                  <div style={{ display:'flex', gap:8 }}>
                    <input className="pa-input" value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addVideoLink(); } }}
                      placeholder="https://www.youtube.com/watch?v=..." dir="ltr" style={{ flex:1 }}/>
                    <button type="button" className="pa-upload-btn pa-btn" onClick={addVideoLink} disabled={!isYouTubeUrl(newVideoUrl)}>
                      <Video size={14}/> أضف
                    </button>
                  </div>
                  {newVideoUrl.trim() && !isYouTubeUrl(newVideoUrl) && (
                    <p style={{ marginTop:5, fontSize:'.72rem', color:'#f87171' }}>مش رابط يوتيوب صحيح</p>
                  )}
                </div>

                {/* Preview grid — all media in current order */}
                {form.media.length > 0 && (
                  <div style={{ marginBottom:'1.4rem' }}>
                    <span className="pa-section-label">المحتوى المضاف ({form.media.length})</span>
                    <div className="pa-media-grid">
                      {form.media.map(item => (
                        <div key={item.id} className="pa-media-item">
                          {item.type === 'image'
                            ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={item.url} alt=""/>
                            : youtubeThumbnail(item.url)
                              ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={youtubeThumbnail(item.url)!} alt=""/>
                              : <div className="pa-media-item-video"><Video size={20} style={{color:'rgba(155,89,208,0.6)'}}/></div>
                          }
                          <div className="pa-media-type" style={{ background: item.type==='image' ? 'rgba(84,22,181,0.8)' : 'rgba(58,161,161,0.8)', color:'#fff' }}>
                            {item.type==='image' ? 'IMG' : 'VID'}
                          </div>
                          <button className="pa-media-del pa-btn" onClick={() => removeMedia(item.id)}><X size={10}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Reorder Section — ONE combined list ── */}
                {form.media.length > 0 && (
                  <div style={{ marginBottom:'1.4rem', border:'1px solid rgba(84,22,181,0.25)', borderRadius:14, overflow:'hidden' }}>
                    <button className="pa-btn" onClick={() => setShowReorder(v => !v)}
                      style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.2rem', background: showReorder ? 'rgba(84,22,181,0.12)' : 'rgba(84,22,181,0.06)', color:'rgba(155,89,208,0.85)', fontWeight:700, fontSize:'.88rem', borderBottom: showReorder ? '1px solid rgba(84,22,181,0.2)' : 'none' }}
                    >
                      <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <GripVertical size={15}/>
                        ترتيب الصور والفيديوهات
                      </span>
                      <motion.div animate={{ rotate: showReorder ? 180 : 0 }} transition={{ duration:.2 }}>
                        <ChevronDown size={16}/>
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {showReorder && (
                        <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:.25 }} style={{ overflow:'hidden' }}>
                          <div style={{ padding:'1rem 1.2rem' }}>
                            <div style={{ fontSize:'.68rem', color:'rgba(155,89,208,0.4)', marginBottom:10, textAlign:'center' }}>
                              اسحب لتغيير الترتيب — الصور والفيديوهات في قائمة واحدة
                            </div>
                            <Reorder.Group axis="y" values={form.media} onReorder={media => setForm(f => ({ ...f, media }))}>
                              {form.media.map((item, idx) => (
                                <Reorder.Item key={item.id} value={item}>
                                  <div className="pa-reorder-row">
                                    <GripVertical size={16} style={{ color:'rgba(84,22,181,0.4)', flexShrink:0 }}/>
                                    {item.type === 'image'
                                      ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={item.url} alt="" className="pa-reorder-thumb"/>
                                      : youtubeThumbnail(item.url)
                                        ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={youtubeThumbnail(item.url)!} alt="" className="pa-reorder-thumb"/>
                                        : <div style={{ width:44, height:32, borderRadius:6, background:'rgba(58,161,161,0.1)', border:'1px solid rgba(58,161,161,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Video size={14} style={{color:'rgba(58,161,161,0.7)'}}/></div>
                                    }
                                    <span style={{ fontSize:'.7rem', color:'rgba(155,89,208,0.5)', fontWeight:700 }}>#{idx+1}</span>
                                    <span className="pa-type-badge" style={{ background: item.type==='image' ? 'rgba(84,22,181,0.2)' : 'rgba(58,161,161,0.15)', color: item.type==='image' ? 'rgba(155,89,208,0.8)' : 'rgba(58,161,161,0.9)' }}>
                                      {item.type==='image' ? 'صورة' : 'فيديو'}
                                    </span>
                                    <span className="pa-reorder-url">{item.url.split('/').pop()}</span>
                                    <button className="pa-btn" onClick={() => removeMedia(item.id)} style={{ width:22, height:22, borderRadius:'50%', background:'rgba(220,50,50,0.1)', border:'1px solid rgba(220,50,50,0.2)', color:'rgba(220,100,100,0.7)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                      <X size={10}/>
                                    </button>
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

                {/* Toggles */}
                <div style={{ display:'flex', gap:'1.5rem', marginBottom:'1.6rem', flexWrap:'wrap' }}>
                  {[
                    { key:'featured', label:'مميز ⭐', color:'#FFD700' },
                    { key:'active',   label:'نشط',     color:'#3AA1A1' },
                  ].map(t => (
                    <label key={t.key} className="pa-toggle">
                      <div className="pa-toggle-box" style={{ background: form[t.key as keyof FormState] ? t.color : 'rgba(255,255,255,0.1)' }} onClick={() => setForm(f => ({ ...f, [t.key]: !f[t.key as keyof FormState] }))}>
                        <div className="pa-toggle-thumb" style={{ left: form[t.key as keyof FormState] ? 21 : 3 }}/>
                      </div>
                      <span style={{ fontSize:'.85rem', color:'rgba(200,190,230,0.7)', fontWeight:600 }}>{t.label}</span>
                    </label>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:10 }}>
                  <button className="pa-btn" onClick={save} disabled={saving || !form.title.trim()}
                    style={{ flex:1, padding:'.85rem', borderRadius:12, background: saving||!form.title.trim() ? 'rgba(84,22,181,0.3)' : 'linear-gradient(135deg,#5416B5,#7F3AA1)', color:'#fff', fontWeight:700, fontSize:'.95rem', boxShadow:'0 4px 16px rgba(84,22,181,0.3)', cursor: saving||!form.title.trim() ? 'not-allowed' : 'pointer' }}>
                    {saving ? 'جاري الحفظ...' : (editId ? 'حفظ التعديلات' : 'إضافة الباكدج')}
                  </button>
                  <button className="pa-btn" onClick={closeModal}
                    style={{ padding:'.85rem 1.4rem', borderRadius:12, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(200,185,230,0.6)', fontWeight:600 }}>
                    إلغاء
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

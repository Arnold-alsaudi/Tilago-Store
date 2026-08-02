'use client';

import { useState, useRef } from 'react';
import { AnimatePresence, motion, Reorder } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Upload, Star, Layers, GripVertical, ImagePlus } from 'lucide-react';
import Image from 'next/image';
import { youtubeThumbnail } from '@/lib/youtube';

interface FormState {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  images: string[];
  videoUrl: string;
  featured: boolean;
  active: boolean;
}

const empty: FormState = { title:'', description:'', price:'', imageUrl:'', images:[], videoUrl:'', featured:false, active:true };

const ACCENT = '#3AA1A1';
const GRAD   = 'linear-gradient(135deg, #5416B5, #3AA1A1)';

export function AdminStream({ packages: init }: { packages: any[] }) {
  const [packages, setPackages] = useState(init);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [uploadingCover,   setUploadingCover]   = useState(false);
  const [uploadingPreview, setUploadingPreview]  = useState(false);

  const coverRef   = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLInputElement>(null);

  const [newImgUrl, setNewImgUrl] = useState('');

  /* ── Upload (صور بس — الفيديو بقى رابط يوتيوب) ── */
  const upload = async (
    file: File,
    field: 'imageUrl' | '__preview',
    setUploading: (v: boolean) => void,
  ) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res  = await fetch('/api/admin/upload', { method:'POST', body:fd });
      const data = await res.json().catch(() => ({ error:`HTTP ${res.status}` }));
      if (!data.url) { setError(data.error ?? 'فشل رفع الملف'); return; }
      if (field === '__preview') {
        setForm(f => ({ ...f, images: [...f.images, data.url] }));
      } else {
        setForm(f => ({ ...f, [field]: data.url }));
      }
    } catch (e: any) { setError(e?.message ?? 'فشل رفع الملف'); }
    finally { setUploading(false); }
  };

  const addPreviewUrl = () => {
    const url = newImgUrl.trim();
    if (!url) return;
    setForm(f => ({ ...f, images: [...f.images, url] }));
    setNewImgUrl('');
  };

  const removePreview = (idx: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const openCreate = () => {
    setForm(empty); setEditingId(null); setError(''); setNewImgUrl(''); setShowForm(true);
  };

  const openEdit = (p: any) => {
    setForm({
      title:       p.title       ?? '',
      description: p.description ?? '',
      price:       String(p.price ?? 0),
      imageUrl:    p.imageUrl    ?? '',
      images:      Array.isArray(p.images) ? [...p.images] : [],
      videoUrl:    p.videoUrl    ?? '',
      featured:    Boolean(p.featured),
      active:      p.active !== false,
    });
    setEditingId(p.id); setError(''); setNewImgUrl(''); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const body = {
      title:       form.title.trim(),
      description: form.description.trim(),
      price:       parseFloat(form.price) || 0,
      category:    'STREAM',
      imageUrl:    form.imageUrl || '',
      images:      form.images,
      videoUrl:    form.videoUrl || null,
      tags:        [],
      featured:    form.featured,
      active:      form.active,
    };
    try {
      if (editingId) {
        const res  = await fetch(`/api/products/${editingId}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { setError(data.error ?? `خطأ ${res.status}`); return; }
        setPackages(prev => prev.map(p => p.id === editingId ? data : p));
      } else {
        const res  = await fetch('/api/products', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { setError(data.error ?? `خطأ ${res.status}`); return; }
        setPackages(prev => [data, ...prev]);
      }
      setShowForm(false);
    } catch (e: any) {
      setError(e?.message ?? 'حدث خطأ، حاول مجدداً');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف هذا الباكدج نهائياً؟')) return;
    const res = await fetch(`/api/products/${id}`, { method:'DELETE' });
    if (res.ok) setPackages(prev => prev.filter(p => p.id !== id));
    else setError('فشل الحذف');
  };

  return (
    <div style={{ minHeight:'100vh', paddingTop:'6rem', paddingBottom:'5rem', paddingInline:'1rem' }}>
      <div style={{ maxWidth:'960px', margin:'0 auto' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(58,161,161,0.15)', border:'1px solid rgba(58,161,161,0.3)' }}>
              <Layers size={20} style={{ color:ACCENT }}/>
            </div>
            <div>
              <h1 style={{ fontFamily:"'Oxanium',sans-serif", fontWeight:800, fontSize:'1.5rem', background:GRAD, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Stream Packages
              </h1>
              <p style={{ color:'#9B8FC0', fontSize:'.75rem', marginTop:2 }}>{packages.length} باكدج</p>
            </div>
          </div>
          <button onClick={openCreate}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'.6rem 1.2rem', borderRadius:12, background:GRAD, color:'#fff', fontWeight:700, fontSize:'.85rem', border:'none', cursor:'pointer', boxShadow:'0 4px 18px rgba(84,22,181,0.3)' }}>
            <Plus size={15}/> إضافة باكدج
          </button>
        </div>

        {/* Table */}
        <div className="glass-card" style={{ borderRadius:16, overflow:'hidden' }}>
          {packages.length === 0 ? (
            <div style={{ padding:'4rem', textAlign:'center' }}>
              <Layers size={38} style={{ margin:'0 auto 12px', color:'#9B8FC0', opacity:.3 }}/>
              <p style={{ color:'#9B8FC0', fontSize:'.875rem' }}>لا توجد باكدجات — اضغط &quot;إضافة باكدج&quot; للبدء</p>
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(84,22,181,0.2)' }}>
                  {['الباكدج','الصور','السعر','الحالة','إجراءات'].map(h=>(
                    <th key={h} style={{ padding:'12px 16px', textAlign:'right', fontSize:'.72rem', color:'#9B8FC0', fontWeight:500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {packages.map(p=>(
                  <tr key={p.id} style={{ borderTop:'1px solid rgba(84,22,181,0.08)' }}
                    onMouseEnter={e=>(e.currentTarget.style.background='rgba(84,22,181,0.05)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>

                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        {p.imageUrl ? (
                          <div style={{ position:'relative', width:56, height:38, borderRadius:8, overflow:'hidden', flexShrink:0, background:'rgba(84,22,181,0.15)' }}>
                            <Image src={p.imageUrl} alt="" fill style={{ objectFit:'cover' }} sizes="56px"/>
                            {p.videoUrl && (
                              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.4)' }}>
                                <div style={{ width:14, height:14, borderRadius:'50%', background:'rgba(255,255,255,0.85)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                  <div style={{ width:0, height:0, borderTop:'3px solid transparent', borderBottom:'3px solid transparent', borderLeft:`5px solid ${ACCENT}`, marginLeft:1 }}/>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ width:56, height:38, borderRadius:8, background:'rgba(58,161,161,0.08)', border:'1px solid rgba(58,161,161,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <Layers size={16} style={{ color:ACCENT, opacity:.4 }}/>
                          </div>
                        )}
                        <div>
                          <p style={{ fontSize:'.875rem', fontWeight:600, color:'#F0E6FF' }}>{p.title}</p>
                          {p.featured && (
                            <span style={{ fontSize:'.7rem', color:'#FFD700', display:'flex', alignItems:'center', gap:3 }}>
                              <Star size={9} fill="currentColor"/> مميز
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding:'12px 16px', fontSize:'.8rem', color:'#9B8FC0' }}>
                      {(p.images?.length ?? 0)} صورة
                    </td>

                    <td style={{ padding:'12px 16px', fontFamily:"'Oxanium',sans-serif", fontWeight:700, fontSize:'.875rem', background:GRAD, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                      {p.price} EGP
                    </td>

                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:'.72rem', padding:'3px 10px', borderRadius:20, background: p.active ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)', color: p.active ? '#4ade80' : '#f87171' }}>
                        {p.active ? 'نشط' : 'مخفي'}
                      </span>
                    </td>

                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', gap:4 }}>
                        <button onClick={()=>openEdit(p)} title="تعديل" style={actionBtn}
                          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(84,22,181,0.2)';(e.currentTarget as HTMLButtonElement).style.color='#F0E6FF';}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='transparent';(e.currentTarget as HTMLButtonElement).style.color='#9B8FC0';}}>
                          <Edit2 size={14}/>
                        </button>
                        <button onClick={()=>handleDelete(p.id)} title="حذف" style={actionBtn}
                          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(248,113,113,0.1)';(e.currentTarget as HTMLButtonElement).style.color='#f87171';}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='transparent';(e.currentTarget as HTMLButtonElement).style.color='#9B8FC0';}}>
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'4rem 1rem 4rem', background:'rgba(0,0,0,0.82)', backdropFilter:'blur(6px)', overflowY:'auto' }}>
            <motion.div initial={{ scale:.93, opacity:0, y:20 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:.93, opacity:0, y:20 }}
              className="glass-card"
              style={{ padding:'1.75rem', borderRadius:20, width:'100%', maxWidth:520, border:'1px solid rgba(58,161,161,0.25)' }}>

              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
                <h2 style={{ fontWeight:700, fontSize:'1.1rem', color:'#F0E6FF' }}>
                  {editingId ? 'تعديل الباكدج' : 'إضافة باكدج جديد'}
                </h2>
                <button onClick={()=>setShowForm(false)} style={{ padding:4, borderRadius:8, background:'transparent', border:'none', cursor:'pointer', color:'#9B8FC0' }}>
                  <X size={18}/>
                </button>
              </div>

              {error && (
                <div style={{ marginBottom:'1rem', padding:'.75rem', borderRadius:12, background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', color:'#f87171', fontSize:'.85rem' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

                <Field label="الاسم *">
                  <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required
                    placeholder="مثال: ABN Shroud Pack" style={inputStyle}/>
                </Field>

                <Field label="الوصف *">
                  <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} required rows={2}
                    placeholder="وصف قصير..." style={{ ...inputStyle, resize:'none' }}/>
                </Field>

                <Field label="السعر (EGP)">
                  <input type="number" min="0" step="0.01" value={form.price}
                    onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="0" style={inputStyle}/>
                </Field>

                {/* ── Cover ── */}
                <Field label="صورة الغلاف (Cover)">
                  <div style={{ display:'flex', gap:8 }}>
                    <input value={form.imageUrl} onChange={e=>setForm(f=>({...f,imageUrl:e.target.value}))}
                      placeholder="رابط الصورة أو ارفع" style={{ ...inputStyle, flex:1 }}/>
                    <button type="button" onClick={()=>coverRef.current?.click()} disabled={uploadingCover} style={uploadBtnStyle}>
                      <Upload size={13}/> {uploadingCover ? '...' : 'رفع'}
                    </button>
                    <input ref={coverRef} type="file" accept="image/*" style={{ display:'none' }}
                      onChange={e=>e.target.files?.[0] && upload(e.target.files[0],'imageUrl',setUploadingCover)}/>
                  </div>
                  {form.imageUrl && (
                    <div style={{ marginTop:8, position:'relative', width:'100%', height:90, borderRadius:10, overflow:'hidden', border:'1px solid rgba(58,161,161,0.2)' }}>
                      <Image src={form.imageUrl} alt="cover" fill style={{ objectFit:'cover' }} sizes="500px"/>
                      <button type="button" onClick={()=>setForm(f=>({...f,imageUrl:''}))}
                        style={{ position:'absolute', top:4, right:4, padding:'2px 6px', borderRadius:6, background:'rgba(0,0,0,0.6)', border:'none', cursor:'pointer', color:'#f87171', fontSize:'.75rem' }}>
                        ×
                      </button>
                    </div>
                  )}
                </Field>

                {/* ── Preview Images ── */}
                <Field label={`صور المعاينة — ${form.images.length} صورة (اسحب لترتيب)`}>
                  {form.images.length > 0 && (
                    <Reorder.Group axis="y" values={form.images} onReorder={imgs=>setForm(f=>({...f,images:imgs}))}
                      as="ul" style={{ listStyle:'none', padding:0, margin:0, marginBottom:8, display:'flex', flexDirection:'column', gap:5 }}>
                      {form.images.map((url,idx)=>(
                        <Reorder.Item key={url+String(idx)} value={url} as="li"
                          style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 8px', borderRadius:10, background:'rgba(84,22,181,0.1)', border:'1px solid rgba(84,22,181,0.2)', cursor:'grab', listStyle:'none' }}>
                          <GripVertical size={13} style={{ color:'#9B8FC0', flexShrink:0 }}/>
                          <div style={{ position:'relative', width:44, height:28, borderRadius:5, overflow:'hidden', flexShrink:0, background:'#000' }}>
                            <Image src={url} alt="" fill style={{ objectFit:'cover' }} sizes="44px"/>
                          </div>
                          <p style={{ flex:1, fontSize:'.7rem', color:'#9B8FC0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {idx+1}. {url.split('/').pop()}
                          </p>
                          <button type="button" onClick={()=>removePreview(idx)}
                            style={{ padding:'2px 5px', borderRadius:5, background:'rgba(248,113,113,0.12)', border:'none', cursor:'pointer', color:'#f87171', flexShrink:0, fontSize:'.75rem' }}>
                            ×
                          </button>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  )}

                  <div style={{ display:'flex', gap:6 }}>
                    <input value={newImgUrl} onChange={e=>setNewImgUrl(e.target.value)}
                      onKeyDown={e=>{ if(e.key==='Enter'){e.preventDefault();addPreviewUrl();} }}
                      placeholder="رابط صورة جديدة..."
                      style={{ ...inputStyle, flex:1, fontSize:'.8rem', padding:'.5rem .8rem' }}/>
                    <button type="button" onClick={addPreviewUrl}
                      style={{ ...uploadBtnStyle, color:ACCENT, borderColor:'rgba(58,161,161,0.4)', background:'rgba(58,161,161,0.08)' }}>
                      <ImagePlus size={13}/> أضف
                    </button>
                    <button type="button" onClick={()=>previewRef.current?.click()} disabled={uploadingPreview} style={uploadBtnStyle}>
                      <Upload size={13}/> {uploadingPreview ? '...' : 'رفع'}
                    </button>
                    <input ref={previewRef} type="file" accept="image/*" style={{ display:'none' }}
                      onChange={e=>e.target.files?.[0] && upload(e.target.files[0],'__preview',setUploadingPreview)}/>
                  </div>
                </Field>

                {/* ── فيديو يوتيوب ── */}
                <Field label="فيديو معاينة يوتيوب (اختياري)">
                  <input value={form.videoUrl} onChange={e=>setForm(f=>({...f,videoUrl:e.target.value}))}
                    placeholder="https://www.youtube.com/watch?v=..." dir="ltr" style={inputStyle}/>
                  {form.videoUrl && (
                    youtubeThumbnail(form.videoUrl) ? (
                      <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:8 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={youtubeThumbnail(form.videoUrl)!} alt="" style={{ height:48, borderRadius:8, objectFit:'cover' }}/>
                        <button type="button" onClick={()=>setForm(f=>({...f,videoUrl:''}))}
                          style={{ fontSize:'.72rem', color:'#f87171', background:'none', border:'none', cursor:'pointer', flexShrink:0 }}>
                          × حذف
                        </button>
                      </div>
                    ) : (
                      <p style={{ marginTop:5, fontSize:'.72rem', color:'#f87171' }}>مش رابط يوتيوب صحيح</p>
                    )
                  )}
                </Field>

                {/* Toggles */}
                <div style={{ display:'flex', gap:'1.5rem' }}>
                  {[{ key:'featured', label:'مميز (أولاً)' },{ key:'active', label:'نشط (ظاهر)' }].map(({ key, label })=>(
                    <label key={key} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'.85rem', color:'#9B8FC0', cursor:'pointer', userSelect:'none' }}>
                      <input type="checkbox" checked={(form as any)[key]}
                        onChange={e=>setForm(f=>({...f,[key]:e.target.checked}))} style={{ accentColor:ACCENT }}/>
                      {label}
                    </label>
                  ))}
                </div>

                <button type="submit" disabled={saving}
                  style={{ width:'100%', padding:'.8rem', borderRadius:12, background:GRAD, color:'#fff', fontWeight:700, fontSize:'.9rem', border:'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .65 : 1, marginTop:4 }}>
                  {saving ? 'جاري الحفظ...' : editingId ? 'حفظ التعديلات' : 'إضافة الباكدج'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize:'.72rem', color:'#9B8FC0', display:'block', marginBottom:5 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width:'100%', background:'rgba(84,22,181,0.1)', border:'1px solid rgba(84,22,181,0.3)',
  borderRadius:12, padding:'.6rem 1rem', fontSize:'.85rem', color:'#F0E6FF', outline:'none',
  fontFamily:"'Cairo','29LtBukra',sans-serif",
};

const uploadBtnStyle: React.CSSProperties = {
  display:'flex', alignItems:'center', gap:5, padding:'.55rem .7rem', borderRadius:10,
  fontSize:'.75rem', fontWeight:600, background:'rgba(84,22,181,0.15)',
  border:'1px solid rgba(84,22,181,0.3)', color:'#9B8FC0', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0,
};

const actionBtn: React.CSSProperties = {
  padding:6, borderRadius:8, background:'transparent', border:'none', cursor:'pointer', color:'#9B8FC0', transition:'all .2s',
};

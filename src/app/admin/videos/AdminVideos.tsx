'use client';

import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Upload, Star, Video, ImageDown } from 'lucide-react';
import Image from 'next/image';
import { youtubeThumbnail } from '@/lib/youtube';
import { mediaKind, videoPoster } from '@/lib/media';
import { uploadVideoDirect } from '@/lib/uploadClient';

const empty = { title: '', description: '', price: '', imageUrl: '', videoUrl: '', featured: false, active: true };

export function AdminVideos({ videos: init }: { videos: any[] }) {
  const [videos, setVideos] = useState(init);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);

  const uploadVideo = async (file: File) => {
    setUploadingVideo(true); setError('');
    try {
      const url = await uploadVideoDirect(file);
      setForm(f => ({ ...f, videoUrl: url }));
    } catch (e: any) { setError(e?.message ?? 'فشل رفع الفيديو'); }
    finally { setUploadingVideo(false); }
  };

  const upload = async (file: File, field: 'imageUrl') => {
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      if (data.url) setForm(f => ({ ...f, [field]: data.url }));
      else setError(data.error ?? 'فشل الرفع');
    } catch (e: any) { setError(e?.message ?? 'فشل الرفع'); }
    finally { setUploadingImg(false); }
  };

  const openCreate = () => { setForm(empty); setEditingId(null); setError(''); setShowForm(true); };
  const openEdit = (v: any) => {
    setForm({ title: v.title, description: v.description, price: String(v.price), imageUrl: v.imageUrl, videoUrl: v.videoUrl ?? '', featured: v.featured, active: v.active });
    setEditingId(v.id);
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const body = { ...form, price: parseFloat(form.price), category: 'VIDEO', tags: [] };
    try {
      if (editingId) {
        const res = await fetch(`/api/products/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) { setError((await res.json()).error ?? 'فشل التعديل'); return; }
        const updated = await res.json();
        setVideos(prev => prev.map(v => v.id === editingId ? updated : v));
      } else {
        const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { setError(data.error ?? 'فشل الإضافة'); return; }
        setVideos(prev => [data, ...prev]);
      }
      setShowForm(false);
    } catch { setError('حدث خطأ، حاول مرة أخرى'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف هذا الفيديو؟')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) setVideos(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(84,22,181,0.2)' }}>
              <Video size={20} style={{ color: '#9B59D0' }} />
            </div>
            <div>
              <h1 className="font-orbitron font-bold text-2xl gradient-text">Video Products</h1>
              <p className="text-text-muted text-xs">{videos.length} فيديو</p>
            </div>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #5416B5, #7F3AA1)' }}>
            <Plus size={16} /> إضافة فيديو
          </button>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          {videos.length === 0 ? (
            <div className="p-16 text-center">
              <Video size={40} className="mx-auto mb-3 text-text-muted opacity-30" />
              <p className="text-text-muted text-sm">لا توجد فيديوهات — اضغط &quot;إضافة فيديو&quot; للبدء</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-accent-deep/20">
                  <th className="px-4 py-3 text-left text-xs text-text-muted font-medium">الفيديو</th>
                  <th className="px-4 py-3 text-left text-xs text-text-muted font-medium">السعر</th>
                  <th className="px-4 py-3 text-left text-xs text-text-muted font-medium">الحالة</th>
                  <th className="px-4 py-3 text-left text-xs text-text-muted font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {videos.map(v => (
                  <tr key={v.id} className="border-t border-accent-deep/10 hover:bg-accent-deep/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {v.imageUrl && (
                          <div className="relative w-12 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-accent-deep/20">
                            <Image src={v.imageUrl} alt="" fill className="object-cover" sizes="48px" />
                            {v.videoUrl && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <div className="w-4 h-4 rounded-full bg-white/80 flex items-center justify-center">
                                  <div style={{ width:0, height:0, borderTop:'3px solid transparent', borderBottom:'3px solid transparent', borderLeft:'5px solid #5416B5', marginLeft:'1px' }} />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-text-primary">{v.title}</p>
                          {v.featured && <span className="text-xs text-yellow-400 flex items-center gap-1"><Star size={10} fill="currentColor" /> مميز</span>}
                          {v.description && <p className="text-xs text-text-muted truncate max-w-[220px] mt-0.5">{v.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold gradient-text text-sm">{v.price} EGP</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${v.active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                        {v.active ? 'نشط' : 'مخفي'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-accent-deep/20 text-text-muted hover:text-text-primary transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
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

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="glass-card p-7 rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">

              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg text-text-primary">{editingId ? 'تعديل الفيديو' : 'إضافة فيديو جديد'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-accent-deep/20 transition-colors">
                  <X size={18} className="text-text-muted" />
                </button>
              </div>

              {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                <Field label="الاسم *">
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                    placeholder="مثال: Venom Intro Pack"
                    className="w-full bg-accent-deep/10 border border-accent-deep/30 rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-violet transition-colors" />
                </Field>

                <Field label="الوصف *">
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={3}
                    placeholder="وصف قصير للفيديو..."
                    className="w-full bg-accent-deep/10 border border-accent-deep/30 rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-violet transition-colors resize-none" />
                </Field>

                <Field label="السعر (EGP) *">
                  <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required
                    placeholder="0"
                    className="w-full bg-accent-deep/10 border border-accent-deep/30 rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-violet transition-colors" />
                </Field>

                {/* Thumbnail */}
                <Field label="الصورة المصغرة *">
                  <div className="flex gap-2">
                    <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} required
                      placeholder="رابط أو ارفع ملف"
                      className="flex-1 bg-accent-deep/10 border border-accent-deep/30 rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-violet transition-colors" />
                    <button type="button" onClick={() => imgRef.current?.click()} disabled={uploadingImg}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium bg-accent-deep/20 hover:bg-accent-deep/30 text-text-muted transition-colors whitespace-nowrap">
                      <Upload size={13} /> {uploadingImg ? '...' : 'رفع'}
                    </button>
                    <input ref={imgRef} type="file" accept="image/*" className="hidden"
                      onChange={e => e.target.files?.[0] && upload(e.target.files[0], 'imageUrl')} />
                  </div>
                  {form.imageUrl && (
                    <div className="mt-2 relative w-full h-28 rounded-xl overflow-hidden border border-accent-deep/20">
                      <Image src={form.imageUrl} alt="" fill className="object-cover" sizes="400px" />
                    </div>
                  )}
                </Field>

                {/* الفيديو — رابط يوتيوب أو رفع من الجهاز */}
                <Field label="الفيديو (رابط يوتيوب أو رفع من الجهاز)">
                  <div className="flex gap-2">
                    <input value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))}
                      placeholder="https://youtube.com/... أو ارفع ملف"
                      dir="ltr"
                      className="flex-1 bg-accent-deep/10 border border-accent-deep/30 rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-violet transition-colors" />
                    <button type="button" onClick={() => vidRef.current?.click()} disabled={uploadingVideo}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium bg-accent-deep/20 hover:bg-accent-deep/30 text-text-muted transition-colors whitespace-nowrap">
                      <Upload size={13} /> {uploadingVideo ? '...' : 'رفع'}
                    </button>
                    <input ref={vidRef} type="file" accept="video/*" className="hidden"
                      onChange={e => e.target.files?.[0] && uploadVideo(e.target.files[0])} />
                  </div>
                  {form.videoUrl && (
                    mediaKind(form.videoUrl) === 'youtube' ? (
                      <div className="mt-2 flex items-center gap-3">
                        <img src={youtubeThumbnail(form.videoUrl)!} alt="" className="h-16 rounded-lg object-cover" />
                        <button type="button"
                          onClick={() => setForm(f => ({ ...f, imageUrl: youtubeThumbnail(f.videoUrl) ?? f.imageUrl }))}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-accent-deep/20 hover:bg-accent-deep/30 text-text-muted transition-colors whitespace-nowrap">
                          <ImageDown size={13} /> استخدمها كصورة مصغرة
                        </button>
                      </div>
                    ) : mediaKind(form.videoUrl) === 'video' ? (
                      <div className="mt-2 flex items-center gap-3">
                        <video src={form.videoUrl} muted playsInline preload="metadata" className="h-16 rounded-lg object-cover" />
                        {videoPoster(form.videoUrl) && (
                          <button type="button"
                            onClick={() => setForm(f => ({ ...f, imageUrl: videoPoster(f.videoUrl) ?? f.imageUrl }))}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-accent-deep/20 hover:bg-accent-deep/30 text-text-muted transition-colors whitespace-nowrap">
                            <ImageDown size={13} /> استخدم أول لقطة كصورة مصغرة
                          </button>
                        )}
                      </div>
                    ) : <p className="mt-1 text-xs text-red-400">رابط غير صحيح</p>
                  )}
                </Field>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer select-none">
                    <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="accent-accent-deep" />
                    مميز (ظهور أولاً)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer select-none">
                    <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="accent-accent-deep" />
                    نشط (ظاهر للعملاء)
                  </label>
                </div>

                <button type="submit" disabled={saving}
                  className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-60 mt-1"
                  style={{ background: 'linear-gradient(135deg, #5416B5, #7F3AA1)' }}>
                  {saving ? 'جاري الحفظ...' : editingId ? 'حفظ التعديلات' : 'إضافة الفيديو'}
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
      <label className="text-xs text-text-muted mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

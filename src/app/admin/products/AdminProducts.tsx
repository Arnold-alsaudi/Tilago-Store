'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Star, X, Upload } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

const CATEGORIES = ['ALERTS', 'STREAM', 'PACKAGE', 'THREE_D'] as const;
const SUB_CATEGORIES: Record<string, { value: string; label: string }[]> = {
  ALERTS: [
    { value: 'diamond',  label: 'الأليرتات الماسية' },
    { value: 'golden',   label: 'الأليرتات الذهبية' },
    { value: 'platinum', label: 'الأليرتات البلاتينية' },
    { value: 'anime',    label: 'الأليرتات الأنمي' },
    { value: 'snow',     label: 'الأليرتات الثلجية' },
    { value: 'fire',     label: 'الأليرتات ثري دي' },
  ],
  STREAM: [],
  PACKAGE: [],
  THREE_D: [],
};
const emptyForm = { title: '', description: '', price: '', category: 'ALERTS', subCategory: 'diamond', imageUrl: '', videoUrl: '', tags: '', featured: false };

export function AdminProducts({ products: initialProducts }: { products: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingVid, setUploadingVid] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File, type: 'image' | 'video') => {
    const setter = type === 'image' ? setUploadingImg : setUploadingVid;
    setter(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      let data: any = {};
      try { data = await res.json(); } catch { data = { error: `HTTP ${res.status}` }; }
      if (data.url) {
        if (type === 'image') setForm(f => ({ ...f, imageUrl: data.url }));
        else setForm(f => ({ ...f, videoUrl: data.url }));
      } else setError(data.error ?? 'فشل الرفع');
    } catch (e: any) { setError(e?.message ?? 'فشل الرفع'); }
    finally { setter(false); }
  };

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setError(''); setShowForm(true); };
  const openEdit = (p: any) => {
    setForm({ title: p.title, description: p.description, price: String(p.price), category: p.category, subCategory: p.subCategory ?? 'diamond', imageUrl: p.imageUrl, videoUrl: p.videoUrl ?? '', tags: (p.tags ?? []).join(', '), featured: p.featured });
    setEditingId(p.id);
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const body = { ...form, price: parseFloat(form.price), tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean), subCategory: form.subCategory || null };
    try {
      if (editingId) {
        const res = await fetch(`/api/products/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) { const d = await res.json(); setError(d.error ?? 'فشل التعديل'); return; }
        const updated = await res.json();
        setProducts(prev => prev.map(p => p.id === editingId ? updated : p));
      } else {
        const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) { const d = await res.json(); setError(d.error ?? 'فشل الإضافة'); return; }
        const created = await res.json();
        setProducts(prev => [created, ...prev]);
      }
      setShowForm(false);
    } catch { setError('حدث خطأ، حاول مرة أخرى'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-orbitron font-bold text-3xl gradient-text">Manage Products</h1>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #5416B5, #7F3AA1)' }}>
            <Plus size={18} /> Add Product
          </button>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full admin-table">
            <thead><tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-t border-accent-deep/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl && <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-accent-deep/20">
                        <Image src={p.imageUrl} alt="" fill className="object-cover" sizes="40px" />
                      </div>}
                      <div>
                        <p className="text-sm font-medium text-text-primary truncate max-w-[200px]">{p.title}</p>
                        {p.featured && <span className="text-xs text-highlight flex items-center gap-1"><Star size={10} fill="#F0830B" /> Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-md bg-accent-deep/20 text-text-muted">{p.category.replace('_', ' ')}</span></td>
                  <td className="px-4 py-3 font-bold gradient-text">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${p.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{p.active ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-accent-deep/20 text-text-muted hover:text-text-primary transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <div className="p-12 text-center text-text-muted">No products yet</div>}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-8 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-xl text-text-primary">{editingId ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setShowForm(false)}><X size={20} className="text-text-muted" /></button>
              </div>
              {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">{error}</div>}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {([
                  { label: 'Title', key: 'title', type: 'text', required: true },
                  { label: 'Price', key: 'price', type: 'number', required: true },
                  { label: 'Tags (comma separated)', key: 'tags', type: 'text', required: false },
                ] as const).map(({ label, key, type, required }) => (
                  <div key={key}>
                    <label className="text-xs text-text-muted mb-1 block">{label}</label>
                    <input type={type} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required={required}
                      className="w-full bg-accent-deep/10 border border-accent-deep/30 rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-violet transition-colors" />
                  </div>
                ))}

                {/* Image upload */}
                <div>
                  <label className="text-xs text-text-muted mb-1 block">الصورة</label>
                  <div className="flex gap-2 items-center">
                    <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} required
                      placeholder="رابط أو ارفع ملف"
                      className="flex-1 bg-accent-deep/10 border border-accent-deep/30 rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-violet transition-colors" />
                    <button type="button" onClick={() => imgRef.current?.click()} disabled={uploadingImg}
                      className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm font-medium bg-accent-deep/20 hover:bg-accent-deep/30 text-text-muted transition-colors whitespace-nowrap">
                      <Upload size={14} /> {uploadingImg ? '...' : 'رفع'}
                    </button>
                    <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'image')} />
                  </div>
                  {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-2 h-20 rounded-lg object-cover" />}
                </div>

                {/* Video upload */}
                <div>
                  <label className="text-xs text-text-muted mb-1 block">الفيديو (اختياري)</label>
                  <div className="flex gap-2 items-center">
                    <input value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })}
                      placeholder="رابط أو ارفع ملف"
                      className="flex-1 bg-accent-deep/10 border border-accent-deep/30 rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-violet transition-colors" />
                    <button type="button" onClick={() => vidRef.current?.click()} disabled={uploadingVid}
                      className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm font-medium bg-accent-deep/20 hover:bg-accent-deep/30 text-text-muted transition-colors whitespace-nowrap">
                      <Upload size={14} /> {uploadingVid ? '...' : 'رفع'}
                    </button>
                    <input ref={vidRef} type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'video')} />
                  </div>
                  {form.videoUrl && <p className="mt-1 text-xs text-green-400 truncate">{form.videoUrl}</p>}
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3}
                    className="w-full bg-accent-deep/10 border border-accent-deep/30 rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-violet transition-colors resize-none" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value, subCategory: SUB_CATEGORIES[e.target.value]?.[0]?.value ?? '' })}
                    className="w-full bg-accent-deep/10 border border-accent-deep/30 rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-violet transition-colors">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                  </select>
                </div>

                {SUB_CATEGORIES[form.category]?.length > 0 && (
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">القسم الفرعي (مطلوب للـ Alerts)</label>
                    <select value={form.subCategory} onChange={e => setForm({ ...form, subCategory: e.target.value })}
                      className="w-full bg-accent-deep/10 border border-accent-deep/30 rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-violet transition-colors">
                      {SUB_CATEGORIES[form.category].map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                )}
                <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="accent-accent-deep" />
                  Featured product
                </label>
                <button type="submit" disabled={saving}
                  className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #5416B5, #7F3AA1)' }}>
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Product'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

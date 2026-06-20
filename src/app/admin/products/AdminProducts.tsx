'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Star, X } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

const CATEGORIES = ['ALERTS', 'STREAM', 'PACKAGE', 'THREE_D'] as const;

export function AdminProducts({ products: initialProducts }: { products: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: 'ALERTS', imageUrl: '', videoUrl: '', tags: '', featured: false });
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: parseFloat(form.price), tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }),
      });
      if (res.ok) {
        const p = await res.json();
        setProducts(prev => [p, ...prev]);
        setShowForm(false);
        setForm({ title: '', description: '', price: '', category: 'ALERTS', imageUrl: '', videoUrl: '', tags: '', featured: false });
      }
    } finally { setSaving(false); }
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
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #5416B5, #7F3AA1)' }}>
            <Plus size={18} /> Add Product
          </button>
        </div>

        {/* Products table */}
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
                      <button className="p-1.5 rounded-lg hover:bg-accent-deep/20 text-text-muted hover:text-text-primary transition-colors"><Edit2 size={14} /></button>
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

      {/* Create modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-8 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-xl text-text-primary">Add Product</h2>
                <button onClick={() => setShowForm(false)}><X size={20} className="text-text-muted" /></button>
              </div>
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                {[
                  { label: 'Title', key: 'title', type: 'text', required: true },
                  { label: 'Price (USD)', key: 'price', type: 'number', required: true },
                  { label: 'Image URL', key: 'imageUrl', type: 'url', required: true },
                  { label: 'Video URL (optional)', key: 'videoUrl', type: 'url', required: false },
                  { label: 'Tags (comma separated)', key: 'tags', type: 'text', required: false },
                ].map(({ label, key, type, required }) => (
                  <div key={key}>
                    <label className="text-xs text-text-muted mb-1 block">{label}</label>
                    <input type={type} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required={required}
                      className="w-full bg-accent-deep/10 border border-accent-deep/30 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent-violet transition-colors" />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3}
                    className="w-full bg-accent-deep/10 border border-accent-deep/30 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent-violet transition-colors resize-none" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-accent-deep/10 border border-accent-deep/30 rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-violet transition-colors">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="accent-accent-deep" />
                  Featured product
                </label>
                <button type="submit" disabled={saving}
                  className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #5416B5, #7F3AA1)' }}>
                  {saving ? 'Creating...' : 'Create Product'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, MessageSquare, User } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 flex items-center justify-center">
      <div className="max-w-lg w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-orbitron font-bold text-4xl gradient-text text-center mb-2">Get In Touch</h1>
          <p className="text-text-muted text-center mb-8">Custom projects, questions, or collaborations — we&apos;re here.</p>

          {sent ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="glass-card p-8 rounded-2xl text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #5416B5, #7F3AA1)' }}>
                <Send size={28} className="text-white" />
              </div>
              <h2 className="font-orbitron font-bold text-xl text-text-primary mb-2">Message Sent!</h2>
              <p className="text-text-muted">We&apos;ll get back to you within 24 hours.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl flex flex-col gap-4">
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                  className="w-full bg-accent-deep/10 border border-accent-deep/30 rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent-violet transition-colors" />
              </div>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="email" placeholder="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                  className="w-full bg-accent-deep/10 border border-accent-deep/30 rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent-violet transition-colors" />
              </div>
              <div className="relative">
                <MessageSquare size={16} className="absolute left-3 top-3.5 text-text-muted" />
                <input type="text" placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required
                  className="w-full bg-accent-deep/10 border border-accent-deep/30 rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent-violet transition-colors" />
              </div>
              <textarea placeholder="Your message..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={4}
                className="w-full bg-accent-deep/10 border border-accent-deep/30 rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent-violet transition-colors resize-none" />
              <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #5416B5, #7F3AA1)', boxShadow: '0 0 20px rgba(84,22,181,0.4)' }}>
                <Send size={18} /> {loading ? 'Sending...' : 'Send Message'}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

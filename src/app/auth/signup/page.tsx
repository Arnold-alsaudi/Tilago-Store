'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Chrome } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return; }
      await signIn('credentials', { email, password, redirect: false });
      router.push('/alerts');
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md rounded-2xl"
      >
        <h1 className="font-orbitron font-bold text-2xl gradient-text text-center mb-2">Create Account</h1>
        <p className="text-text-muted text-sm text-center mb-8">Join Tilago and elevate your stream</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required
              className="w-full bg-accent-deep/10 border border-accent-deep/30 rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent-violet transition-colors" />
          </div>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required
              className="w-full bg-accent-deep/10 border border-accent-deep/30 rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent-violet transition-colors" />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 8 chars)" required minLength={8}
              className="w-full bg-accent-deep/10 border border-accent-deep/30 rounded-xl pl-10 pr-10 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent-violet transition-colors" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #5416B5, #7F3AA1)', boxShadow: '0 0 20px rgba(84,22,181,0.4)' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </motion.button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-accent-deep/30" /></div>
          <div className="relative flex justify-center text-xs text-text-muted"><span className="px-2 bg-[rgba(12,5,22,0.8)]">or</span></div>
        </div>

        <button onClick={() => signIn('google', { callbackUrl: '/alerts' })}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-accent-deep/30 text-sm text-text-muted hover:border-accent-violet hover:text-text-primary transition-all">
          <Chrome size={18} /> Continue with Google
        </button>

        <p className="text-center text-text-muted text-sm mt-6">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-accent-violet hover:text-highlight transition-colors font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}

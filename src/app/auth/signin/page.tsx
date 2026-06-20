'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Chrome } from 'lucide-react';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (result?.error) setError('Invalid email or password');
    else router.push('/alerts');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md rounded-2xl"
      >
        <h1 className="font-orbitron font-bold text-2xl gradient-text text-center mb-2">Welcome Back</h1>
        <p className="text-text-muted text-sm text-center mb-8">Sign in to your Tilago account</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full bg-accent-deep/10 border border-accent-deep/30 rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent-violet transition-colors"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full bg-accent-deep/10 border border-accent-deep/30 rounded-xl pl-10 pr-10 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent-violet transition-colors"
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #5416B5, #7F3AA1)', boxShadow: '0 0 20px rgba(84,22,181,0.4)' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-accent-deep/30" />
          </div>
          <div className="relative flex justify-center text-xs text-text-muted bg-transparent">
            <span className="px-2 bg-[rgba(12,5,22,0.8)]">or continue with</span>
          </div>
        </div>

        <button
          onClick={() => signIn('google', { callbackUrl: '/alerts' })}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-accent-deep/30 text-sm text-text-muted hover:border-accent-violet hover:text-text-primary transition-all"
        >
          <Chrome size={18} /> Continue with Google
        </button>

        <p className="text-center text-text-muted text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-accent-violet hover:text-highlight transition-colors font-medium">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

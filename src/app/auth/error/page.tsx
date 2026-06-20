'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-8 max-w-md w-full rounded-2xl text-center">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h1 className="font-orbitron font-bold text-2xl text-text-primary mb-2">Auth Error</h1>
        <p className="text-text-muted mb-6">There was a problem signing you in. Please try again.</p>
        <Link href="/auth/signin" className="px-6 py-3 rounded-xl font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #5416B5, #7F3AA1)' }}>
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

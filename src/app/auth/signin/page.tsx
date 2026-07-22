'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
    if (result?.error) setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    else router.push('/alerts');
  };

  return (
    <div className="si-wrap" dir="rtl">
      <div className="si-card">
        {/* Logo */}
        <div className="si-logo-box">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images.png" alt="Tilago" className="si-logo" />
        </div>

        <h1 className="si-title">مرحباً بعودتك</h1>
        <p className="si-sub">سجّل دخولك إلى Tilago Store</p>

        {/* Google */}
        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/alerts' })}
          className="si-google"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
          </svg>
          المتابعة بحساب Google
        </button>

        <div className="si-divider">
          <span />
          <p>أو</p>
          <span />
        </div>

        {error && <div className="si-error">{error}</div>}

        <form onSubmit={handleSubmit} className="si-form">
          <label className="si-label">البريد الإلكتروني</label>
          <div className="si-field">
            <i className="fas fa-envelope" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <label className="si-label">كلمة المرور</label>
          <div className="si-field">
            <i className="fas fa-lock" />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button type="button" className="si-eye" onClick={() => setShowPw(!showPw)}>
              <i className={showPw ? 'fas fa-eye-slash' : 'fas fa-eye'} />
            </button>
          </div>

          <div className="si-forgot">
            <Link href="/auth/signup">نسيت كلمة المرور؟</Link>
          </div>

          <button type="submit" disabled={loading} className="si-submit">
            {loading ? 'جارٍ الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <p className="si-signup">
          ليس لديك حساب؟{' '}
          <Link href="/auth/signup">إنشاء حساب</Link>
        </p>
      </div>

      <style>{`
        .si-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 100px 20px 60px;
          background: linear-gradient(180deg, #0F083B, #0C0516);
          font-family: 'Cairo', sans-serif;
        }
        .si-card {
          width: 100%;
          max-width: 400px;
          background: rgba(15, 8, 59, 0.55);
          border: 1px solid rgba(84, 22, 181, 0.35);
          border-radius: 20px;
          padding: 2.5rem 2rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        .si-logo-box {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .si-logo {
          height: 80px;
          width: auto;
          object-fit: contain;
          mix-blend-mode: screen;
          image-rendering: -webkit-optimize-contrast;
        }
        .si-title {
          text-align: center;
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0 0 6px;
          background: linear-gradient(135deg, #9B59D0, #5416B5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .si-sub {
          text-align: center;
          color: rgba(185, 175, 215, 0.5);
          font-size: 0.9rem;
          margin: 0 0 1.8rem;
        }
        .si-google {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: #fff;
          color: #222;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Cairo', sans-serif;
          transition: all 0.25s;
        }
        .si-google:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,255,255,0.15); }
        .si-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 1.3rem 0;
        }
        .si-divider span {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(84, 22, 181, 0.5), transparent);
        }
        .si-divider p {
          color: rgba(170, 155, 200, 0.5);
          font-size: 0.75rem;
          margin: 0;
        }
        .si-error {
          margin-bottom: 1rem;
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(231, 76, 60, 0.1);
          border: 1px solid rgba(231, 76, 60, 0.35);
          color: #e74c3c;
          font-size: 0.85rem;
          text-align: center;
        }
        .si-form { display: flex; flex-direction: column; }
        .si-label {
          color: rgba(185, 175, 215, 0.7);
          font-size: 0.82rem;
          margin-bottom: 6px;
        }
        .si-field {
          position: relative;
          margin-bottom: 1rem;
        }
        .si-field > i {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(155, 89, 208, 0.6);
          font-size: 0.95rem;
        }
        .si-field input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 40px 12px 40px;
          border-radius: 11px;
          border: 1px solid rgba(84, 22, 181, 0.3);
          background: rgba(15, 8, 59, 0.6);
          color: #eae6ff;
          font-size: 0.9rem;
          text-align: right;
          font-family: 'Cairo', sans-serif;
          outline: none;
          transition: border-color 0.25s;
        }
        .si-field input:focus { border-color: #9B59D0; }
        .si-field input::placeholder { color: rgba(150, 140, 175, 0.5); }
        .si-eye {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(155, 89, 208, 0.6);
          cursor: pointer;
          font-size: 0.9rem;
        }
        .si-forgot {
          text-align: left;
          margin-bottom: 1.3rem;
        }
        .si-forgot a {
          color: rgba(155, 89, 208, 0.85);
          font-size: 0.78rem;
          text-decoration: none;
        }
        .si-forgot a:hover { color: #9B59D0; }
        .si-submit {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #5416B5, #7F3AA1);
          color: #fff;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Cairo', sans-serif;
          box-shadow: 0 4px 20px rgba(84, 22, 181, 0.4);
          transition: all 0.25s;
        }
        .si-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 7px 26px rgba(84, 22, 181, 0.55); }
        .si-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .si-signup {
          text-align: center;
          color: rgba(170, 160, 205, 0.6);
          font-size: 0.85rem;
          margin: 1.3rem 0 0;
        }
        .si-signup a {
          color: #9B59D0;
          text-decoration: none;
          font-weight: 700;
        }
        .si-signup a:hover { color: #b370e0; }
      `}</style>
    </div>
  );
}

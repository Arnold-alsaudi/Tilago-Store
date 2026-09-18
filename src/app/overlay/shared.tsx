'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, CreditCard, LogIn, ShieldCheck, X } from 'lucide-react';

export type OverlayCategory = 'SUPPORTERS' | 'CHALLENGES' | 'GOALS' | 'DECOR';

export interface AppOverlay {
  id: string; slug: string; title: string; description: string | null;
  category: OverlayCategory; file: string; poster: string | null;
  isFree: boolean; featured: boolean; createdAt: string;
  /** توقيع مؤقت بيخلّي المعاينة تفتح — من غيره الملف بيرجع 404 */
  sig: string;
}

export type AppSub = {
  plan: string; status: string; endsAt: string | null;
  token: string; theme: Record<string, string> | null;
} | null;

/* المفاتيح هي نفس أسماء المتغيّرات اللي ملفات التركيبات بتقراها من الرابط */
export const PALETTES = [
  { key: 'violet', name: 'بنفسجي', dot: '#a855f7', vars: { violet: '#a855f7', grape: '#5416B5', navy: '#0F083B', deep: '#0C0516' } },
  { key: 'fire',   name: 'ناري',   dot: '#f43f5e', vars: { violet: '#f43f5e', grape: '#9f1239', navy: '#2a0712', deep: '#0e0306' } },
  { key: 'gold',   name: 'ذهبي',   dot: '#e9b84a', vars: { violet: '#e9b84a', grape: '#92400e', navy: '#241604', deep: '#0d0802' } },
  { key: 'ice',    name: 'جليدي',  dot: '#38bdf8', vars: { violet: '#38bdf8', grape: '#075985', navy: '#061c2e', deep: '#030a12' } },
  { key: 'toxic',  name: 'سام',    dot: '#4ade80', vars: { violet: '#4ade80', grape: '#166534', navy: '#062014', deep: '#020b06' } },
  { key: 'rose',   name: 'وردي',   dot: '#fb7185', vars: { violet: '#fb7185', grape: '#9d174d', navy: '#2a0a1b', deep: '#0e0309' } },
] as const;

export type Palette = (typeof PALETTES)[number];

export const paletteFromTheme = (theme: Record<string, string> | null | undefined) =>
  PALETTES.find(p => p.vars.violet === theme?.violet)?.key ?? 'violet';

export const PLANS = [
  { key: 'm1', name: 'شهري',   price: 299,  unit: 'شهر',     per: 299, note: 'من غير التزام' },
  { key: 'y',  name: 'سنوي',   price: 2399, unit: 'سنة',     per: 200, note: 'ادفع 8 شهور وخد سنة كاملة', best: true },
  { key: 'm3', name: '3 شهور', price: 749,  unit: '3 شهور',  per: 250, note: 'وفّر 16%' },
] as const;

export type Plan = (typeof PLANS)[number];

export const CATS: { key: OverlayCategory; name: string }[] = [
  { key: 'SUPPORTERS', name: 'داعمين' },
  { key: 'CHALLENGES', name: 'تحديات' },
  { key: 'GOALS',      name: 'أهداف' },
  { key: 'DECOR',      name: 'تزيين' },
];

export const isNew = (iso: string) => Date.now() - new Date(iso).getTime() < 14 * 86400000;

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });

export function previewSrc(o: Pick<AppOverlay, 'slug' | 'sig'>, vars?: Record<string, string>) {
  const q = new URLSearchParams(vars ?? {});
  return `/pv/${o.slug}?${q.toString()}${o.sig ? '&' + o.sig : ''}`;
}

/* ── نافذة الدفع ─────────────────────────────────────────────
   الكارت (بايموب) بيتفعّل لوحده بعد الدفع. PayPal بيوصلك على البوت
   وبيتفعّل من الأدمن بعد ما تتأكد إن الفلوس وصلت. */
export function CheckoutModal({
  plan, email, onClose,
}: { plan: Plan; email: string | null; onClose: () => void }) {
  const [phone, setPhone] = useState('');
  const [paying, setPaying] = useState<'paymob' | 'PayPal' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !paying) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paying, onClose]);

  async function pay(method: 'paymob' | 'PayPal') {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) {
      setError('اكتب رقم موبايل صحيح عشان نقدر نتواصل معاك');
      return;
    }
    setPaying(method); setError(null);
    try {
      const res = await fetch('/api/overlay/subscribe', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ plan: plan.key, method, phone: digits }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? 'حصل خطأ، جرّب تاني'); setPaying(null); return; }

      if (method === 'paymob') { window.location.href = data.url; return; }

      // PayPal مابيدعمش الجنيه — نحوّل بسعر الدولار الحيّ
      let egpPerUsd = 50;
      try {
        const d = await (await fetch('/api/fx')).json();
        if (d?.egpPerUsd > 0) egpPerUsd = d.egpPerUsd;
      } catch {}
      const handle = data.paypalHandle || process.env.NEXT_PUBLIC_PAYPAL_ME;
      if (!handle) { setError('PayPal مش متاح دلوقتي، استخدم الكارت'); setPaying(null); return; }
      const usd = Math.max(1, plan.price / egpPerUsd).toFixed(2);
      window.location.href = `https://www.paypal.me/${handle}/${usd}USD`;
    } catch {
      setError('مفيش اتصال، جرّب تاني'); setPaying(null);
    }
  }

  return (
    <div className="co-back" onClick={e => { if (e.target === e.currentTarget && !paying) onClose(); }}>
      <style>{`
        .co-back{position:fixed;inset:0;z-index:200;background:rgba(6,2,14,.82);backdrop-filter:blur(8px);
          display:grid;place-items:center;padding:1rem;overflow-y:auto;font-family:'Cairo','29LtBukra',sans-serif}
        .co{width:min(100%,440px);background:linear-gradient(180deg,#160c30,#0f0822);border:1px solid rgba(155,89,208,.35);
          border-radius:20px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 40px rgba(84,22,181,.25);color:#cfc6e8}
        .co-h{display:flex;align-items:center;justify-content:space-between;padding:1.1rem 1.3rem}
        .co-h h2{margin:0;font-size:1.05rem;font-weight:800;color:#f3efff}
        .co-x{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;cursor:pointer;
          background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#cfc6e8}
        .co-x:hover{color:#fff;border-color:rgba(155,89,208,.5)}
        .co-sum{display:flex;align-items:baseline;justify-content:space-between;margin:0 1.3rem;padding:1rem 1.1rem;
          border-radius:14px;background:rgba(84,22,181,.14);border:1px solid rgba(155,89,208,.25)}
        .co-sum span{font-size:.85rem;color:#a99fc8}
        .co-sum b{font-family:'Oxanium',sans-serif;font-size:1.7rem;font-weight:800;color:#fff;font-variant-numeric:tabular-nums}
        .co-sum small{font-family:'Cairo',sans-serif;font-size:.8rem;font-weight:500;color:#a99fc8;margin-inline-start:.3rem}
        .co-body{padding:1.1rem 1.3rem 1.3rem}
        .co-login p{margin:0 0 1rem;font-size:.9rem;line-height:1.8;text-align:center}
        .co-lbl{display:block;font-size:.82rem;color:#b9afd6;margin-bottom:.45rem}
        .co-in{width:100%;height:46px;padding:0 .9rem;border-radius:12px;background:rgba(0,0,0,.35);
          border:1px solid rgba(155,89,208,.3);color:#fff;font-family:'Oxanium',sans-serif;font-size:1rem;
          direction:ltr;text-align:left;outline:0;box-sizing:border-box}
        .co-in:focus{border-color:#a36bd0;box-shadow:0 0 0 3px rgba(163,107,208,.18)}
        .co-err{margin-top:.7rem;padding:.6rem .85rem;border-radius:10px;font-size:.84rem;
          background:rgba(240,98,119,.1);border:1px solid rgba(240,98,119,.4);color:#ffd4db}
        .co-methods{display:grid;gap:.6rem;margin-top:1rem}
        .co-m{display:flex;align-items:center;gap:.85rem;width:100%;text-align:right;cursor:pointer;
          padding:.9rem 1rem;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);
          color:#f3efff;font-family:inherit;transition:border-color .2s,background .2s}
        .co-m:hover:not(:disabled){border-color:rgba(163,107,208,.6);background:rgba(84,22,181,.18)}
        .co-m:disabled{opacity:.6;cursor:wait}
        .co-m b{display:block;font-size:.95rem}
        .co-m small{display:block;font-size:.78rem;color:#a99fc8;margin-top:.1rem}
        .co-m .ic{flex:none;width:38px;height:38px;border-radius:10px;display:grid;place-items:center;
          background:rgba(84,22,181,.3);color:#e3d2ff;font-family:'Oxanium',sans-serif;font-weight:800}
        .co-note{display:flex;align-items:center;justify-content:center;gap:.4rem;margin:1rem 0 0;font-size:.8rem;color:#a99fc8}
        .co-note svg{color:#a36bd0}
        .co-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;width:100%;height:48px;border-radius:12px;
          background:linear-gradient(135deg,#6d28d9,#5416B5);color:#fff;font-weight:800;text-decoration:none;
          box-shadow:0 8px 24px rgba(84,22,181,.45)}
        .co-x:focus-visible,.co-m:focus-visible,.co-btn:focus-visible{outline:2px solid #c9a7f0;outline-offset:2px}
      `}</style>
      <div className="co" role="dialog" aria-modal="true" aria-labelledby="co-title">
        <div className="co-h">
          <h2 id="co-title">اشتراك {plan.name}</h2>
          <button type="button" className="co-x" onClick={onClose} disabled={Boolean(paying)} aria-label="إغلاق"><X size={16} /></button>
        </div>

        <div className="co-sum">
          <span>المبلغ</span>
          <b>{plan.price.toLocaleString('en-US')}<small>جنيه / {plan.unit}</small></b>
        </div>

        <div className="co-body">
          {!email ? (
            <div className="co-login">
              <p>الاشتراك بيتربط بحسابك عشان روابطك تفضل معاك. سجّل دخولك وارجع كمّل من نفس المكان.</p>
              <Link className="co-btn" href="/auth/signin?callbackUrl=/overlay%23pricing"><LogIn size={17} /> تسجيل الدخول بجوجل</Link>
            </div>
          ) : (
            <>
              <label className="co-lbl" htmlFor="co-phone">رقم موبايلك</label>
              <input id="co-phone" className="co-in" value={phone} onChange={e => setPhone(e.target.value)}
                inputMode="tel" placeholder="01xxxxxxxxx" autoComplete="tel" disabled={Boolean(paying)} />
              {error && <div className="co-err" role="alert">{error}</div>}

              <div className="co-methods">
                <button type="button" className="co-m" onClick={() => pay('paymob')} disabled={Boolean(paying)}>
                  <span className="ic"><CreditCard size={19} /></span>
                  <span><b>{paying === 'paymob' ? 'بيحوّلك…' : 'فيزا أو ميزا'}</b><small>بيتفعّل فوراً بعد الدفع</small></span>
                </button>
                <button type="button" className="co-m" onClick={() => pay('PayPal')} disabled={Boolean(paying)}>
                  <span className="ic">P</span>
                  <span><b>{paying === 'PayPal' ? 'بيحوّلك…' : 'PayPal'}</b><small>بيتفعّل خلال ساعات بعد ما نتأكد من التحويل</small></span>
                </button>
              </div>

              <p className="co-note"><ShieldCheck size={14} /> استرجاع كامل خلال 7 أيام لو مركّبتش</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* الرجوع من صفحة بايموب — الويبهوك ممكن ياخد ثواني يفعّل */
export function PaidBanner({ live }: { live: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('payment') === 'success') setShow(true);
  }, []);
  if (!show) return null;
  return (
    <div role="status" style={{
      position: 'fixed', bottom: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 150,
      display: 'flex', alignItems: 'center', gap: '.6rem', maxWidth: 'calc(100% - 2rem)',
      background: '#160c30', border: '1px solid rgba(74,222,128,.45)', color: '#f3efff',
      padding: '.7rem .8rem .7rem 1rem', borderRadius: 12, fontSize: '.88rem',
      fontFamily: "'Cairo',sans-serif", boxShadow: '0 12px 30px rgba(0,0,0,.5)',
    }}>
      <Check size={16} color="#4ade80" />
      {live
        ? 'الدفع تم واشتراكك شغّال. روابطك في قسم التركيبات.'
        : 'الدفع وصل. الاشتراك بيتفعّل خلال ثواني، ولو مظهرش حدّث الصفحة.'}
      <button type="button" onClick={() => setShow(false)} aria-label="إغلاق"
        style={{ background: 'none', border: 0, color: '#a99fc8', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
        <X size={14} />
      </button>
    </div>
  );
}

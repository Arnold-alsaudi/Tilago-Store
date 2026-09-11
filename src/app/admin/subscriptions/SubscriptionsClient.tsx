'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Plus, Check, X, RefreshCw, Pause, Play,
  Trash2, Clock, Copy, Inbox,
} from 'lucide-react';

export interface AdminSub {
  id: string;
  userEmail: string;
  plan: string;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  token: string;
  priceLocked: number | null;
  updatedAt: string;
}

interface PendingPay {
  id: string; userEmail: string; userName: string | null;
  amount: number; method: string; createdAt: string;
}

const PLANS = [
  { key: 'm1', label: 'شهري',   months: 1,  price: 299 },
  { key: 'm3', label: '3 شهور', months: 3,  price: 749 },
  { key: 'y',  label: 'سنوي',   months: 12, price: 2399 },
] as const;

const planOf = (k: string) => PLANS.find(p => p.key === k);

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const daysLeft = (endsAt: string | null) =>
  endsAt ? Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000) : null;

const liveNow = (s: AdminSub) => {
  const d = daysLeft(s.endsAt);
  return s.status === 'active' && (d === null || d > 0);
};

export default function SubscriptionsClient({
  items, pending,
}: { items: AdminSub[]; pending: PendingPay[] }) {
  const [list, setList] = useState<AdminSub[]>(items);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<string>('y');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const stats = useMemo(() => {
    const live = list.filter(liveNow);
    const soon = live.filter(s => { const d = daysLeft(s.endsAt); return d !== null && d <= 7; });
    const income = live.reduce((t, s) => t + (s.priceLocked ?? planOf(s.plan)?.price ?? 0), 0);
    return { live: live.length, soon: soon.length, income };
  }, [list]);

  function startFor(e?: string) {
    setEmail(e ?? ''); setPlan('y'); setError(null); setOpen(true);
  }

  async function activate() {
    setBusy(true); setError(null);
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), plan }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'حصل خطأ'); return; }

      setList(prev => {
        const without = prev.filter(s => s.id !== data.id);
        return [data, ...without];
      });
      setNote(data.renewed
        ? `اتجدّد لـ ${email} — بيخلص ${fmtDate(data.endsAt)}`
        : `اتفعّل لـ ${email} — بيخلص ${fmtDate(data.endsAt)}`);
      setTimeout(() => setNote(null), 6000);
      setOpen(false);
    } catch {
      setError('مفيش اتصال بالسيرفر');
    } finally {
      setBusy(false);
    }
  }

  async function patch(s: AdminSub, body: Record<string, unknown>, optimistic?: Partial<AdminSub>) {
    const before = list;
    if (optimistic) setList(prev => prev.map(x => (x.id === s.id ? { ...x, ...optimistic } : x)));
    const res = await fetch(`/api/admin/subscriptions/${s.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) { setList(before); alert('التعديل فشل'); return; }
    const data = await res.json();
    setList(prev => prev.map(x => (x.id === s.id ? { ...x, ...data } : x)));
  }

  async function remove(s: AdminSub) {
    if (!confirm(`تحذف اشتراك ${s.userEmail} نهائياً؟ روابطه كلها هتبطّل.`)) return;
    const before = list;
    setList(prev => prev.filter(x => x.id !== s.id));
    const res = await fetch(`/api/admin/subscriptions/${s.id}`, { method: 'DELETE' });
    if (!res.ok) { setList(before); alert('الحذف فشل'); }
  }

  async function copyToken(s: AdminSub) {
    try {
      await navigator.clipboard.writeText(s.token);
      setCopied(s.id); setTimeout(() => setCopied(null), 2000);
    } catch {}
  }

  const linked = new Set(list.map(s => s.userEmail));

  return (
    <div className="sb" dir="rtl">
      <style>{`
        .sb{
          --deep:#0C0516; --navy:#0F083B; --grape:#5416B5; --violet:#7F3AA1;
          --ink:#e8e4f8; --ink-2:#a09abf; --ink-3:#7d76a0; --accent:#9B59D0;
          --line:rgba(84,22,181,0.2); --line-hot:rgba(84,22,181,0.5);
          --card:rgba(15,8,59,0.5);
          --ok:#4ade80; --warn:#fbbf24; --bad:#fb7185;
          min-height:100vh;padding:2.5rem 5% 5rem;
          background:linear-gradient(var(--navy),var(--deep));
          color:var(--ink-2);
          font-family:'Cairo','29LtBukra','Montserrat',sans-serif;
        }
        .sb-in{width:min(96%,1300px);margin:0 auto}

        .sb-top{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-bottom:1.6rem}
        .sb-title{display:flex;align-items:center;gap:.8rem}
        .sb-title h1{font-family:'Oxanium','29LtBukra',sans-serif;font-size:1.5rem;font-weight:700;color:var(--ink);margin:0}
        .sb-title p{margin:.2rem 0 0;font-size:.85rem;color:var(--ink-3)}
        .sb-ic{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;
          background:rgba(84,22,181,.2);border:1px solid var(--line);color:var(--accent)}

        .sb-btn{
          display:inline-flex;align-items:center;gap:.5rem;cursor:pointer;
          font-family:'Cairo',sans-serif;font-size:.9rem;font-weight:600;
          padding:.65rem 1.4rem;border-radius:50px;border:none;
          background:linear-gradient(135deg,var(--grape),var(--violet));color:#fff;
          box-shadow:0 4px 14px rgba(0,0,0,.45);transition:all .3s;
        }
        .sb-btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.55)}
        .sb-btn.ghost{background:rgba(84,22,181,.18);border:1px solid var(--line);color:var(--ink);box-shadow:none}
        .sb-btn.ghost:hover{background:rgba(84,22,181,.32);border-color:var(--line-hot)}
        .sb-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}
        .sb-btn:focus-visible,.sb-mini:focus-visible,.sb-plan:focus-visible,
        .sb input:focus-visible{outline:2px solid var(--violet);outline-offset:2px}

        /* أرقام سريعة */
        .sb-kpis{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));margin-bottom:2rem}
        .sb-kpi{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:1.2rem 1.3rem}
        .sb-kpi b{display:block;font-family:'Oxanium',sans-serif;font-size:1.9rem;font-weight:800;
          color:var(--ink);line-height:1;font-variant-numeric:tabular-nums}
        .sb-kpi span{font-size:.82rem;color:var(--ink-3);display:block;margin-top:.4rem}
        .sb-kpi.warn b{color:var(--warn)}
        .sb-kpi.money b{color:var(--accent)}

        /* تحويلات مستنية */
        .sb-pend{background:var(--card);border:1px solid rgba(251,191,36,.32);border-radius:14px;
          padding:1.2rem 1.3rem;margin-bottom:2rem}
        .sb-pend h2{display:flex;align-items:center;gap:.5rem;font-family:'Oxanium','29LtBukra',sans-serif;
          font-size:1rem;font-weight:700;color:var(--ink);margin:0 0 .3rem}
        .sb-pend > p{margin:0 0 1rem;font-size:.84rem;color:var(--ink-3)}
        .sb-pay{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;
          padding:.7rem 0;border-top:1px solid var(--line)}
        .sb-pay-l b{display:block;color:var(--ink);font-size:.9rem;margin-bottom:.15rem}
        .sb-pay-l span{font-size:.78rem;color:var(--ink-3)}
        .sb-pay-l em{font-style:normal;color:var(--accent);font-family:'Oxanium',sans-serif}
        .sb-done{font-size:.78rem;color:var(--ok);display:inline-flex;align-items:center;gap:.3rem}

        /* الجدول */
        .sb-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:14px;background:var(--card)}
        table{border-collapse:collapse;width:100%;min-width:820px}
        th,td{padding:.85rem 1rem;text-align:right;border-bottom:1px solid var(--line)}
        thead th{font-family:'Oxanium',sans-serif;font-size:.78rem;color:var(--ink-3);
          background:rgba(12,5,22,.4);font-weight:700}
        tbody tr:last-child td{border-bottom:none}
        tbody tr:hover{background:rgba(84,22,181,.08)}
        .sb-mail{color:var(--ink);font-size:.88rem;direction:ltr;display:inline-block}
        .sb-num{font-family:'Oxanium',sans-serif;font-variant-numeric:tabular-nums;color:var(--ink)}

        .sb-pill{display:inline-flex;align-items:center;gap:.35rem;font-size:.76rem;
          padding:.22rem .6rem;border-radius:50px;border:1px solid var(--line);color:var(--ink-3)}
        .sb-pill.live{color:var(--ok);border-color:rgba(74,222,128,.4)}
        .sb-pill.soon{color:var(--warn);border-color:rgba(251,191,36,.4)}
        .sb-pill.dead{color:var(--bad);border-color:rgba(251,113,133,.4)}
        .sb-dot{width:7px;height:7px;border-radius:50%;background:currentColor;flex:none}

        .sb-acts{display:flex;gap:.35rem;flex-wrap:wrap}
        .sb-mini{display:inline-flex;align-items:center;gap:.3rem;cursor:pointer;
          font-family:'Cairo',sans-serif;font-size:.76rem;padding:.35rem .65rem;border-radius:50px;
          background:rgba(84,22,181,.14);border:1px solid var(--line);color:var(--ink-2);transition:all .22s}
        .sb-mini:hover{background:rgba(84,22,181,.3);color:var(--ink)}
        .sb-mini.del:hover{background:rgba(220,70,70,.24);border-color:rgba(220,70,70,.5);color:#ffd9d9}
        .sb-mini.done{color:var(--ok);border-color:rgba(74,222,128,.4)}

        .sb-empty{border:1px dashed var(--line);border-radius:14px;padding:3.5rem 1.5rem;text-align:center;color:var(--ink-3)}
        .sb-empty b{display:block;color:var(--ink);font-size:1rem;margin-bottom:.4rem;font-family:'Oxanium',sans-serif}

        .sb-note{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:90;
          background:rgba(12,5,22,.94);border:1px solid rgba(74,222,128,.45);color:var(--ok);
          padding:.7rem 1.3rem;border-radius:50px;font-size:.86rem;backdrop-filter:blur(8px)}

        /* النموذج */
        .sb-back{position:fixed;inset:0;z-index:80;background:rgba(6,2,14,.78);backdrop-filter:blur(6px);
          display:grid;place-items:center;padding:1.2rem;overflow-y:auto}
        .sb-form{width:min(100%,520px);background:var(--navy);border:1px solid var(--line-hot);
          border-radius:16px;padding:1.6rem;margin:auto}
        .sb-form-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.2rem}
        .sb-form-top h2{font-family:'Oxanium','29LtBukra',sans-serif;font-size:1.1rem;color:var(--ink);margin:0;font-weight:700}
        .sb-x{background:none;border:1px solid var(--line);color:var(--ink-2);cursor:pointer;
          width:32px;height:32px;border-radius:50%;display:grid;place-items:center;transition:all .22s}
        .sb-x:hover{background:rgba(84,22,181,.3);color:var(--ink)}
        .sb-f{margin-bottom:1.1rem}
        .sb-f label{display:block;font-size:.8rem;color:var(--ink-2);margin-bottom:.35rem}
        .sb-f input{width:100%;padding:.65rem .85rem;border-radius:10px;background:rgba(12,5,22,.6);
          border:1px solid var(--line);color:var(--ink);font-family:'Oxanium',monospace;font-size:.9rem;
          direction:ltr;text-align:left}
        .sb-f input:focus{border-color:var(--line-hot)}
        .sb-plans{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem}
        .sb-plan{cursor:pointer;text-align:center;padding:.85rem .5rem;border-radius:12px;
          background:rgba(84,22,181,.12);border:1px solid var(--line);color:var(--ink-2);transition:all .22s}
        .sb-plan:hover{background:rgba(84,22,181,.26)}
        .sb-plan[aria-pressed="true"]{background:rgba(84,22,181,.36);border-color:var(--line-hot);color:var(--ink)}
        .sb-plan b{display:block;font-family:'Cairo',sans-serif;font-size:.88rem;margin-bottom:.2rem}
        .sb-plan span{font-family:'Oxanium',sans-serif;font-size:.76rem;color:var(--ink-3)}
        .sb-hint{font-size:.8rem;color:var(--ink-3);line-height:1.8;margin:.9rem 0 1.3rem}
        .sb-err{background:rgba(220,70,70,.14);border:1px solid rgba(220,70,70,.4);color:#ffd9d9;
          padding:.6rem .9rem;border-radius:10px;font-size:.84rem;margin-bottom:.9rem}
        .sb-form-acts{display:flex;gap:.6rem;justify-content:flex-end;flex-wrap:wrap}

        @media(max-width:600px){.sb{padding:1.6rem 4% 4rem}.sb-plans{grid-template-columns:1fr}}
        @media(prefers-reduced-motion:reduce){.sb *{animation:none!important;transition:none!important}}
      `}</style>

      <div className="sb-in">
        <div className="sb-top">
          <div className="sb-title">
            <span className="sb-ic"><CreditCard size={22} /></span>
            <div>
              <h1>الاشتراكات</h1>
              <p>{list.length} اشتراك · {stats.live} شغّال</p>
            </div>
          </div>
          <button type="button" className="sb-btn" onClick={() => startFor()}>
            <Plus size={17} /> تفعيل اشتراك
          </button>
        </div>

        <div className="sb-kpis">
          <div className="sb-kpi">
            <b>{stats.live}</b><span>اشتراك شغّال</span>
          </div>
          <div className={`sb-kpi${stats.soon ? ' warn' : ''}`}>
            <b>{stats.soon}</b><span>بيخلص خلال أسبوع</span>
          </div>
          <div className="sb-kpi money">
            <b>{stats.income.toLocaleString('en-US')}</b><span>جنيه من الاشتراكات الشغّالة</span>
          </div>
        </div>

        {/* التحويلات المستنية — دي اللي البوت بيقولك عليها */}
        {pending.length > 0 && (
          <div className="sb-pend">
            <h2><Inbox size={17} /> تحويلات مستنية تأكيد</h2>
            <p>البوت بعتلك دول. أكّد التحويل الأول، وبعدين فعّل الاشتراك.</p>
            {pending.map(p => (
              <div className="sb-pay" key={p.id}>
                <div className="sb-pay-l">
                  <b>{p.userName || p.userEmail}</b>
                  <span>
                    <em>{p.amount.toLocaleString('en-US')}</em> جنيه · {p.method} ·{' '}
                    {new Date(p.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                  </span>
                </div>
                {linked.has(p.userEmail)
                  ? <span className="sb-done"><Check size={13} /> عنده اشتراك</span>
                  : (
                    <button type="button" className="sb-mini" onClick={() => startFor(p.userEmail)}>
                      <Play size={12} /> فعّل
                    </button>
                  )}
              </div>
            ))}
          </div>
        )}

        {list.length === 0 ? (
          <div className="sb-empty">
            <b>لسه مفيش اشتراكات</b>
            لما حد يحوّلك والبوت يقولك، اضغط «تفعيل اشتراك» وحط إيميله.
            النظام هيحسب تاريخ الانتهاء ويولّد روابطه لوحده.
          </div>
        ) : (
          <div className="sb-wrap">
            <table>
              <thead>
                <tr>
                  <th>العميل</th>
                  <th>الخطة</th>
                  <th>الحالة</th>
                  <th>بيخلص</th>
                  <th>فاضل</th>
                  <th>السعر</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {list.map(s => {
                    const d = daysLeft(s.endsAt);
                    const live = liveNow(s);
                    const soon = live && d !== null && d <= 7;
                    return (
                      <motion.tr key={s.id} layout
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <td><span className="sb-mail">{s.userEmail}</span></td>
                        <td>{planOf(s.plan)?.label ?? s.plan}</td>
                        <td>
                          <span className={`sb-pill ${live ? (soon ? 'soon' : 'live') : 'dead'}`}>
                            <i className="sb-dot" />
                            {live ? (soon ? 'قرب يخلص' : 'شغّال') : s.status === 'pending' ? 'مستني' : 'منتهي'}
                          </span>
                        </td>
                        <td>{fmtDate(s.endsAt)}</td>
                        <td className="sb-num">{d === null ? '—' : d > 0 ? `${d} يوم` : 'خلص'}</td>
                        <td className="sb-num">{s.priceLocked?.toLocaleString('en-US') ?? '—'}</td>
                        <td>
                          <div className="sb-acts">
                            <button type="button" className="sb-mini" onClick={() => startFor(s.userEmail)}>
                              <RefreshCw size={12} /> جدّد
                            </button>
                            <button
                              type="button" className="sb-mini"
                              onClick={() => patch(s,
                                { status: s.status === 'active' ? 'expired' : 'active' },
                                { status: s.status === 'active' ? 'expired' : 'active' })}
                            >
                              {s.status === 'active' ? <><Pause size={12} /> أوقف</> : <><Play size={12} /> شغّل</>}
                            </button>
                            <button
                              type="button" className={`sb-mini${copied === s.id ? ' done' : ''}`}
                              onClick={() => copyToken(s)}
                            >
                              <Copy size={12} /> {copied === s.id ? 'اتنسخ' : 'المفتاح'}
                            </button>
                            <button
                              type="button" className="sb-mini"
                              onClick={() => {
                                if (confirm('مفتاح جديد معناه إن كل روابط العميل القديمة هتبطّل. متأكد؟'))
                                  patch(s, { regenerateToken: true });
                              }}
                            >
                              <Clock size={12} /> مفتاح جديد
                            </button>
                            <button type="button" className="sb-mini del" onClick={() => remove(s)}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {note && <div className="sb-note">{note}</div>}

      <AnimatePresence>
        {open && (
          <motion.div className="sb-back"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
          >
            <motion.div className="sb-form"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              transition={{ duration: .22 }}
            >
              <div className="sb-form-top">
                <h2>تفعيل اشتراك</h2>
                <button type="button" className="sb-x" onClick={() => setOpen(false)} aria-label="إغلاق">
                  <X size={16} />
                </button>
              </div>

              {error && <div className="sb-err">{error}</div>}

              <div className="sb-f">
                <label htmlFor="s-email">إيميل العميل</label>
                <input
                  id="s-email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="off"
                />
              </div>

              <div className="sb-f">
                <label>الخطة</label>
                <div className="sb-plans">
                  {PLANS.map(p => (
                    <button
                      key={p.key} type="button" className="sb-plan"
                      aria-pressed={plan === p.key} onClick={() => setPlan(p.key)}
                    >
                      <b>{p.label}</b>
                      <span>{p.price.toLocaleString('en-US')} ج</span>
                    </button>
                  ))}
                </div>
              </div>

              <p className="sb-hint">
                النظام بيحسب تاريخ الانتهاء لوحده. ولو العميل لسه عنده أيام فاضلة،
                المدة الجديدة بتتضاف عليها مش بتلغيها.
              </p>

              <div className="sb-form-acts">
                <button type="button" className="sb-btn ghost" onClick={() => setOpen(false)}>إلغاء</button>
                <button
                  type="button" className="sb-btn" onClick={activate}
                  disabled={busy || !email.trim().includes('@')}
                >
                  <Check size={16} /> {busy ? 'بيفعّل…' : 'فعّل'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

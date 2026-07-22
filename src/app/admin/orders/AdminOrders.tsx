'use client';

import { useState, useEffect, useCallback } from 'react';

interface PaymentRow {
  id: string;
  userEmail: string;
  userName: string | null;
  userPhone: string | null;
  productName: string | null;
  amount: number;
  currency: string;
  method: string;
  deliveryStatus: string;
  createdAt: string;
}

const STATUSES = [
  { value: 'pending',     label: 'قيد المراجعة', color: '#f39c12' },
  { value: 'in_progress', label: 'جارٍ التنفيذ', color: '#3498db' },
  { value: 'delivered',   label: 'تم التسليم',   color: '#2ecc71' },
];

export function AdminOrders() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [storePaused, setStorePaused] = useState(false);
  const [pauseMessage, setPauseMessage] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const load = useCallback(() => {
    fetch('/api/admin/list')
      .then(r => r.json())
      .then(data => Array.isArray(data) && setPayments(data))
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch('/api/settings')
      .then(r => r.json())
      .then(s => { setStorePaused(!!s.storePaused); setPauseMessage(s.pauseMessage ?? ''); })
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, deliveryStatus: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, deliveryStatus } : p));
    await fetch(`/api/admin/payments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveryStatus }),
    }).catch(() => {});
  };

  const togglePause = async () => {
    setSavingSettings(true);
    const next = !storePaused;
    setStorePaused(next);
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storePaused: next, pauseMessage }),
    }).catch(() => {});
    setSavingSettings(false);
  };

  const saveMessage = async () => {
    setSavingSettings(true);
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pauseMessage }),
    }).catch(() => {});
    setSavingSettings(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-bold text-3xl mb-2" style={{ color: '#F0E6FF' }}>📦 إدارة الطلبات</h1>
        <p className="text-sm mb-8" style={{ color: '#9B8FC0' }}>تغيير حالة التسليم وإيقاف الشراء</p>

        {/* ── التحكم في إيقاف الشراء ── */}
        <div className="glass-card rounded-2xl p-6 mb-8" style={{
          border: storePaused ? '1px solid #e74c3c' : '1px solid rgba(122,0,255,0.25)',
          background: storePaused ? 'rgba(231,76,60,0.08)' : 'rgba(122,0,255,0.05)',
        }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="font-bold text-lg" style={{ color: storePaused ? '#e74c3c' : '#F0E6FF' }}>
                {storePaused ? '🔴 الشراء متوقف حالياً' : '🟢 الشراء مفعّل'}
              </h2>
              <p className="text-sm mt-1" style={{ color: '#9B8FC0' }}>
                {storePaused ? 'الزوار لا يستطيعون الشراء الآن' : 'كل شيء يعمل بشكل طبيعي'}
              </p>
            </div>
            <button
              onClick={togglePause}
              disabled={savingSettings}
              className="px-6 py-3 rounded-xl font-bold text-white transition-all"
              style={{
                background: storePaused
                  ? 'linear-gradient(135deg, #27ae60, #2ecc71)'
                  : 'linear-gradient(135deg, #c0392b, #e74c3c)',
                opacity: savingSettings ? 0.6 : 1,
                cursor: savingSettings ? 'wait' : 'pointer',
              }}
            >
              {storePaused ? '✅ تفعيل الشراء' : '⛔ إيقاف الشراء'}
            </button>
          </div>

          <div className="mt-4">
            <label className="text-sm block mb-2" style={{ color: '#9B8FC0' }}>الرسالة اللي هتظهر للزوار وقت الإيقاف:</label>
            <div className="flex gap-2 flex-wrap">
              <input
                value={pauseMessage}
                onChange={e => setPauseMessage(e.target.value)}
                className="flex-1 min-w-[260px] px-4 py-2 rounded-xl text-sm"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(122,0,255,0.3)', color: '#F0E6FF' }}
                placeholder="نعتذر — الطلبات متوقفة مؤقتاً بسبب الضغط، سنعود قريباً"
              />
              <button
                onClick={saveMessage}
                disabled={savingSettings}
                className="px-5 py-2 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(122,0,255,0.3)', color: '#F0E6FF', border: '1px solid rgba(122,0,255,0.5)' }}
              >
                حفظ الرسالة
              </button>
            </div>
          </div>
        </div>

        {/* ── قائمة الطلبات ── */}
        {loading ? (
          <p style={{ color: '#9B8FC0' }}>جارٍ التحميل...</p>
        ) : payments.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center" style={{ color: '#9B8FC0' }}>
            لا توجد طلبات بعد
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {payments.map(p => {
              const st = STATUSES.find(s => s.value === p.deliveryStatus) ?? STATUSES[0];
              return (
                <div key={p.id} className="glass-card rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                  <div style={{ minWidth: 200 }}>
                    <p className="font-bold" style={{ color: '#F0E6FF' }}>{p.productName ?? 'منتج'}</p>
                    <p className="text-xs mt-1" style={{ color: '#9B8FC0' }}>
                      {p.userName ?? '-'} • {p.userEmail}
                    </p>
                    {p.userPhone && (
                      <a href={`tel:${p.userPhone}`} className="text-xs mt-0.5 inline-flex items-center gap-1"
                        style={{ color: '#2ecc71' }}>
                        📱 {p.userPhone}
                      </a>
                    )}
                    <p className="text-xs" style={{ color: '#9B8FC0' }}>
                      {p.amount} {p.currency} • {p.method} • {new Date(p.createdAt).toLocaleString('ar-EG')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {STATUSES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => updateStatus(p.id, s.value)}
                        className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
                        style={{
                          background: p.deliveryStatus === s.value ? `${s.color}33` : 'rgba(255,255,255,0.04)',
                          color: p.deliveryStatus === s.value ? s.color : '#9B8FC0',
                          border: `1px solid ${p.deliveryStatus === s.value ? s.color : 'rgba(255,255,255,0.1)'}`,
                          cursor: 'pointer',
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

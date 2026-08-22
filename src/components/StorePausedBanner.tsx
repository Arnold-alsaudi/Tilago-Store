'use client';

import { useEffect, useState } from 'react';

// بانر يظهر في كل الصفحات لما الأدمن يوقف المتجر.
export function StorePausedBanner() {
  const [paused, setPaused] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(s => { setPaused(!!s.storePaused); setMsg(s.pauseMessage || ''); })
      .catch(() => {});
  }, []);

  if (!paused) return null;

  return (
    <div dir="rtl" style={{
      position: 'sticky', top: 0, zIndex: 1200,
      background: 'linear-gradient(135deg,#c0392b,#e74c3c)',
      color: '#fff', textAlign: 'center',
      padding: '11px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap',
      fontFamily: "'Cairo','29LtBukra','Montserrat',sans-serif",
      borderBottom: '1px solid rgba(255,255,255,0.25)',
      boxShadow: '0 4px 18px rgba(192,57,43,0.4)',
    }}>
      <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>⏸️</span>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.4 }}>
        <b style={{ fontSize: '.95rem', letterSpacing: '.3px' }}>المتجر متوقف مؤقتاً — الطلبات مغلقة حالياً</b>
        {msg && <span style={{ fontSize: '.78rem', opacity: 0.92 }}>{msg}</span>}
      </div>
    </div>
  );
}

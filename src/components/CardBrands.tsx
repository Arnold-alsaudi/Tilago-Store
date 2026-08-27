import type { CSSProperties } from 'react';

// شعارات البطاقات (Visa + ميزة) كـ pills بيضاء أنيقة — لزر الدفع بالكارت، متناسقة مع لوجو PayPal
export function CardBrands({ height = 20 }: { height?: number }) {
  const fs = Math.max(11, Math.round(height * 0.62));
  const pill: CSSProperties = {
    background: '#fff',
    borderRadius: 5,
    padding: `${Math.round(height * 0.16)}px ${Math.round(height * 0.36)}px`,
    display: 'inline-flex',
    alignItems: 'center',
    lineHeight: 1,
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(height * 0.34) }} aria-label="Visa و ميزة">
      <span style={pill}>
        <span style={{ color: '#1A1F71', fontFamily: 'Arial, Helvetica, sans-serif', fontWeight: 800, fontStyle: 'italic', letterSpacing: '.4px', fontSize: fs }}>VISA</span>
      </span>
      <span style={pill}>
        <span style={{ color: '#00A19A', fontFamily: 'Arial, Helvetica, sans-serif', fontWeight: 800, fontSize: fs }}>meeza</span>
      </span>
    </span>
  );
}

'use client';

import { useState } from 'react';

const PACKAGES = [
  {
    id: 'starter',
    title: 'باقة البداية',
    emoji: '🌟',
    color: '#87ceeb',
    price: '199 ريال',
    desc: 'مثالية للمبتدئين في البث المباشر',
    features: ['3 اليرتات', 'أوفرلاي واحد', 'شاشة انتظار', 'دعم فني لمدة أسبوع'],
  },
  {
    id: 'pro',
    title: 'الباقة الاحترافية',
    emoji: '💎',
    color: '#7A00FF',
    price: '399 ريال',
    desc: 'للمبدعين الذين يريدون التميز',
    features: ['6 اليرتات', '2 أوفرلاي', 'شاشات انتظار + BRB', 'لوجو متحرك', 'دعم فني شهر'],
    popular: true,
  },
  {
    id: 'elite',
    title: 'الباقة المتميزة',
    emoji: '👑',
    color: '#FFD700',
    price: '699 ريال',
    desc: 'الباقة الشاملة لبث احترافي كامل',
    features: ['10 اليرتات', '3 أوفرلاي', 'شاشات متعددة', 'لوجو + إنترو', 'تأثيرات 3D', 'دعم فني 3 أشهر'],
  },
  {
    id: 'custom',
    title: 'باقة مخصصة',
    emoji: '🎨',
    color: '#ff69b4',
    price: 'حسب الطلب',
    desc: 'صمم باقتك بنفسك حسب احتياجاتك',
    features: ['عدد غير محدود من المنتجات', 'تصميم خاص 100%', 'دعم مستمر', 'تعديلات غير محدودة'],
  },
];

const CONTACT_BTNS = [
  { icon: 'fab fa-whatsapp', label: 'طلب الآن',     href: 'https://wa.me/1234567890', color: '#25D366' },
  { icon: 'fab fa-telegram', label: 'تيليجرام',     href: 'https://t.me/yourchannel', color: '#0088cc' },
  { icon: 'fab fa-discord',  label: 'ديسكورد',      href: 'https://discord.gg/yourserver', color: '#5865F2' },
  { icon: 'fas fa-headset',  label: 'خدمة العملاء', href: 'mailto:support@tilago.com', color: '#7A00FF' },
];

export default function PackagePage() {
  const [selected, setSelected] = useState<typeof PACKAGES[0] | null>(null);

  return (
    <div style={{ padding: '2rem 5%' }}>
      <section style={{ textAlign: 'center', padding: '3rem 0 2rem' }}>
        <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '2.5rem', color: '#fff', textShadow: '0 0 20px #7A00FF', marginBottom: '1rem' }}>
          الباقات الكاملة
        </h1>
        <p style={{ color: '#bbb', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto 2rem' }}>
          اختر الباقة المناسبة لك وابدأ رحلتك في البث الاحترافي
        </p>
        <div style={{ height: 4, width: 120, background: 'linear-gradient(90deg,#7A00FF,#FFD700)', borderRadius: 2, margin: '0 auto' }} />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '2rem', marginTop: '2rem' }}>
        {PACKAGES.map(pkg => (
          <div key={pkg.id} onClick={() => setSelected(pkg)} style={{
            background: 'rgba(20,10,30,0.8)',
            border: `2px solid ${pkg.popular ? pkg.color : 'rgba(122,0,255,0.3)'}`,
            borderRadius: 20,
            padding: '2rem',
            cursor: 'pointer',
            transition: 'all 0.3s',
            position: 'relative',
            textAlign: 'center',
            boxShadow: pkg.popular ? `0 0 30px ${pkg.color}44` : 'none',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-8px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 40px ${pkg.color}66`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = pkg.popular ? `0 0 30px ${pkg.color}44` : 'none'; }}>
            {pkg.popular && (
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: pkg.color, color: '#000', fontWeight: 700, fontSize: '0.8rem', padding: '4px 16px', borderRadius: 50 }}>
                الأكثر شيوعاً ⭐
              </div>
            )}
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{pkg.emoji}</div>
            <h2 style={{ fontFamily: "'Orbitron',sans-serif", color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem' }}>{pkg.title}</h2>
            <p style={{ color: '#bbb', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{pkg.desc}</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: pkg.color, marginBottom: '1.5rem', textShadow: `0 0 10px ${pkg.color}` }}>
              {pkg.price}
            </div>
            <ul style={{ listStyle: 'none', textAlign: 'right', marginBottom: '1.5rem' }}>
              {pkg.features.map((f, i) => (
                <li key={i} style={{ color: '#ddd', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                  <i className="fas fa-check-circle" style={{ color: pkg.color, marginLeft: '0.5rem' }} /> {f}
                </li>
              ))}
            </ul>
            <button className="btn-purple" style={{ width: '100%', justifyContent: 'center' }}>
              اختر هذه الباقة
            </button>
          </div>
        ))}
      </div>

      {/* Contact */}
      <section style={{ marginTop: '3rem', textAlign: 'center' }}>
        <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>تواصل معنا لطلب باقتك</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          {CONTACT_BTNS.map(btn => (
            <a key={btn.label} href={btn.href} target="_blank" rel="noreferrer" className="contact-btn">
              <i className={btn.icon} style={{ color: btn.color }} /> {btn.label}
            </a>
          ))}
        </div>
      </section>

      {/* Package detail modal */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{selected.emoji}</div>
              <h2 style={{ fontFamily: "'Orbitron',sans-serif", color: '#fff', fontSize: '1.8rem', textShadow: `0 0 10px ${selected.color}` }}>{selected.title}</h2>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: selected.color, margin: '1rem 0' }}>{selected.price}</div>
            </div>
            <div className="info-box">
              <h3 style={{ color: '#fff', marginBottom: '1rem' }}>محتويات الباقة:</h3>
              <ul style={{ listStyle: 'none' }}>
                {selected.features.map((f, i) => (
                  <li key={i} style={{ color: '#ddd', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <i className="fas fa-check-circle" style={{ color: selected.color, marginLeft: '0.7rem' }} /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              {CONTACT_BTNS.map(btn => (
                <a key={btn.label} href={btn.href} target="_blank" rel="noreferrer" className="contact-btn" style={{ fontSize: '0.9rem' }}>
                  <i className={btn.icon} style={{ color: btn.color }} /> {btn.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

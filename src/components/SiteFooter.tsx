'use client';

export function SiteFooter() {
  return (
    <footer>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <h4 style={{ fontFamily: "'Oxanium',sans-serif", color: '#fff', marginBottom: '1rem', textShadow: '0 0 8px #7A00FF' }}>Tilago</h4>
          <p style={{ color: '#aaa', maxWidth: 300 }}>أفضل اليرتات جاهزة لقنواتك، تصميم مستقبلي، أداء عالي، ودعم احترافي.</p>
        </div>
        <div>
          <h4 style={{ fontFamily: "'Oxanium',sans-serif", color: '#fff', marginBottom: '1rem' }}>روابط سريعة</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[['/', 'الرئيسية'], ['/alerts', 'الاليرتات'], ['/stream', 'الاوفرليات'], ['/package', 'الباقات']].map(([href, label]) => (
              <li key={href}><a href={href} style={{ color: '#bbb', textDecoration: 'none', transition: '0.3s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#7A00FF')}
                onMouseLeave={e => (e.currentTarget.style.color = '#bbb')}>{label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{ fontFamily: "'Oxanium',sans-serif", color: '#fff', marginBottom: '1rem' }}>تواصل معنا</h4>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[
              { icon: 'fab fa-instagram', href: '#' },
              { icon: 'fab fa-tiktok', href: '#' },
              { icon: 'fab fa-youtube', href: '#' },
              { icon: 'fab fa-twitter', href: '#' },
              { icon: 'fab fa-discord', href: '#' },
            ].map(({ icon, href }) => (
              <a key={icon} href={href} className="social-icon">
                <i className={icon} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', borderTop: '1px solid rgba(122,0,255,0.2)', paddingTop: '1.5rem' }}>
        &copy; 2025 Tilago. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';

interface MyOrder {
  id: string;
  productName: string | null;
  amount: number;
  currency: string;
  method: string;
  status: string;
  deliveryStatus: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  pending:     { label: 'قيد المراجعة',  color: '#f39c12', icon: 'fas fa-clock' },
  in_progress: { label: 'جارٍ التنفيذ',  color: '#3498db', icon: 'fas fa-cog' },
  delivered:   { label: 'تم التسليم',    color: '#2ecc71', icon: 'fas fa-check-circle' },
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/orders/mine')
      .then(r => r.json())
      .then(data => Array.isArray(data) && setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  if (status === 'loading') {
    return <div style={S.page}><p style={S.muted}>جارٍ التحميل...</p></div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <i className="fas fa-lock" style={{ fontSize: '2.5rem', color: '#7A00FF', marginBottom: 16 }} />
          <h2 style={{ marginBottom: 8 }}>سجّل دخولك أولاً</h2>
          <p style={{ ...S.muted, marginBottom: 20 }}>لعرض طلباتك يجب تسجيل الدخول</p>
          <button style={S.btn} onClick={() => signIn('google')}>
            <i className="fab fa-google" style={{ marginLeft: 8 }} /> تسجيل الدخول بجوجل
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <h1 style={S.title}>📦 طلباتي</h1>
      <p style={{ ...S.muted, textAlign: 'center', marginBottom: 32 }}>
        مرحباً {session?.user?.name} — هنا تتابع حالة طلباتك
      </p>

      {loading ? (
        <p style={{ ...S.muted, textAlign: 'center' }}>جارٍ تحميل الطلبات...</p>
      ) : orders.length === 0 ? (
        <div style={S.card}>
          <i className="fas fa-box-open" style={{ fontSize: '2.5rem', color: '#555', marginBottom: 16 }} />
          <p style={S.muted}>لا توجد طلبات بعد</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720, margin: '0 auto' }}>
          {orders.map(order => {
            const st = STATUS_LABELS[order.deliveryStatus] ?? STATUS_LABELS.pending;
            return (
              <div key={order.id} style={S.orderCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{order.productName ?? 'منتج Tilago'}</h3>
                    <p style={{ ...S.muted, fontSize: '.8rem', margin: '4px 0 0' }}>
                      {new Date(order.createdAt).toLocaleString('ar-EG')} • {order.method}
                    </p>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{
                      background: `${st.color}22`,
                      color: st.color,
                      border: `1px solid ${st.color}55`,
                      borderRadius: 20,
                      padding: '6px 14px',
                      fontSize: '.85rem',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                    }}>
                      <i className={st.icon} style={{ marginLeft: 6 }} />
                      {st.label}
                    </span>
                  </div>
                </div>
                {order.deliveryStatus !== 'delivered' && (
                  <p style={{ ...S.muted, fontSize: '.78rem', marginTop: 10, marginBottom: 0 }}>
                    ⏳ سيتم التسليم خلال 24 ساعة من تأكيد الدفع
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '70vh', padding: '100px 20px 60px', color: '#e0e0ff' },
  title: { textAlign: 'center', fontSize: '1.8rem', marginBottom: 8 },
  muted: { color: '#9090b0' },
  card: {
    maxWidth: 420, margin: '40px auto', textAlign: 'center',
    background: 'rgba(122,0,255,0.06)', border: '1px solid rgba(122,0,255,0.25)',
    borderRadius: 16, padding: '40px 24px',
  },
  orderCard: {
    background: 'rgba(122,0,255,0.06)', border: '1px solid rgba(122,0,255,0.2)',
    borderRadius: 14, padding: '18px 20px',
  },
  btn: {
    background: 'linear-gradient(135deg, #7A00FF, #B366FF)', color: '#fff',
    border: 'none', borderRadius: 10, padding: '12px 28px',
    fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold',
  },
};

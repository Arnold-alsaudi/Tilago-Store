'use client';

import { useState } from 'react';
import { Shield, ShieldOff, Trash2, User as UserIcon } from 'lucide-react';

interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  role: 'USER' | 'ADMIN';
  image: string | null;
  createdAt: string;
  _count: { orders: number };
}

export function AdminUsers({ users: initial, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const [users, setUsers] = useState<UserRow[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const changeRole = async (id: string, role: 'USER' | 'ADMIN') => {
    setBusy(id); setError('');
    const prev = users;
    setUsers(u => u.map(x => x.id === id ? { ...x, role } : x));
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    }).catch(() => null);
    if (!res || !res.ok) {
      setUsers(prev); // رجّع القديم لو فشل
      const d = res ? await res.json().catch(() => ({})) : {};
      setError(d.error ?? 'فشل تغيير الصلاحية');
    }
    setBusy(null);
  };

  const removeUser = async (id: string) => {
    if (!confirm('متأكد إنك عايز تحذف المستخدم ده؟')) return;
    setBusy(id); setError('');
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' }).catch(() => null);
    if (res && res.ok) {
      setUsers(u => u.filter(x => x.id !== id));
    } else {
      const d = res ? await res.json().catch(() => ({})) : {};
      setError(d.error ?? 'فشل حذف المستخدم');
    }
    setBusy(null);
  };

  const admins = users.filter(u => u.role === 'ADMIN').length;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-bold text-3xl mb-2" style={{ color: '#F0E6FF' }}>👥 إدارة المستخدمين</h1>
        <p className="text-sm mb-6" style={{ color: '#9B8FC0' }}>
          {users.length} مستخدم • {admins} أدمن — تحكّم في الصلاحيات
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.4)', color: '#e74c3c' }}>
            {error}
          </div>
        )}

        {users.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center" style={{ color: '#9B8FC0' }}>
            لا يوجد مستخدمون بعد
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map(u => (
              <div key={u.id} className="glass-card rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3" style={{ minWidth: 220 }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(84,22,181,0.2)', border: '1px solid rgba(155,89,208,0.3)' }}>
                    {u.image
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={u.image} alt="" className="w-full h-full rounded-full object-cover" />
                      : <UserIcon size={18} style={{ color: '#9B59D0' }} />}
                  </div>
                  <div>
                    <p className="font-bold flex items-center gap-2" style={{ color: '#F0E6FF' }}>
                      {u.name ?? 'بدون اسم'}
                      {u.role === 'ADMIN' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                          style={{ background: 'rgba(240,131,11,0.15)', color: '#F0830B', border: '1px solid rgba(240,131,11,0.4)' }}>
                          ADMIN
                        </span>
                      )}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#9B8FC0' }}>{u.email}</p>
                    <p className="text-xs" style={{ color: '#9B8FC0' }}>
                      {u._count.orders} طلب • انضم {new Date(u.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {u.id === currentUserId ? (
                    <span className="text-xs px-3 py-2" style={{ color: '#9B8FC0' }}>حسابك</span>
                  ) : (
                    <>
                      {u.role === 'USER' ? (
                        <button onClick={() => changeRole(u.id, 'ADMIN')} disabled={busy === u.id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                          style={{ background: 'rgba(240,131,11,0.12)', color: '#F0830B', border: '1px solid rgba(240,131,11,0.4)', cursor: 'pointer' }}>
                          <Shield size={13} /> تعيين أدمن
                        </button>
                      ) : (
                        <button onClick={() => changeRole(u.id, 'USER')} disabled={busy === u.id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                          style={{ background: 'rgba(155,89,208,0.12)', color: '#9B59D0', border: '1px solid rgba(155,89,208,0.4)', cursor: 'pointer' }}>
                          <ShieldOff size={13} /> إزالة الأدمن
                        </button>
                      )}
                      <button onClick={() => removeUser(u.id)} disabled={busy === u.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                        style={{ background: 'rgba(231,76,60,0.1)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.35)', cursor: 'pointer' }}>
                        <Trash2 size={13} /> حذف
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

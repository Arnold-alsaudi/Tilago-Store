'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Users, Package, Download, FileSpreadsheet, Power } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DashboardStats } from '@/types';
import { formatPrice, formatPriceAscii } from '@/lib/utils';

interface Props { stats: DashboardStats; }

const COLORS = ['#5416B5', '#7F3AA1', '#F0830B', '#9B8FC0'];

export function AdminDashboard({ stats }: Props) {
  const [storePaused, setStorePaused] = useState(false);
  const [pauseMessage, setPauseMessage] = useState('المتجر مغلق مؤقتاً، سيعود قريباً.');
  const [toggling, setToggling] = useState(false);
  const [showMsgInput, setShowMsgInput] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      if (d.storePaused === 'true') setStorePaused(true);
      if (d.pauseMessage) setPauseMessage(d.pauseMessage);
    }).catch(() => {});
  }, []);

  const toggleStore = async () => {
    setToggling(true);
    const newVal = !storePaused;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storePaused: newVal, pauseMessage }),
      });
      if (!res.ok) {
        alert(`فشل تغيير حالة المتجر (رمز ${res.status}). تأكد إنك مسجّل دخول كأدمن وحاول تاني.`);
        return;
      }
      setStorePaused(newVal);
    } catch {
      alert('تعذّر الاتصال بالسيرفر، حاول تاني.');
    } finally {
      setToggling(false);
    }
  };

  const saveMessage = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pauseMessage }),
      });
      if (!res.ok) { alert('فشل حفظ الرسالة، حاول تاني.'); return; }
      setShowMsgInput(false);
    } catch {
      alert('تعذّر الاتصال بالسيرفر، حاول تاني.');
    }
  };
  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: '#F0830B' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, color: '#5416B5' },
    { label: 'Total Users', value: stats.totalUsers.toString(), icon: Users, color: '#7F3AA1' },
    { label: 'Products', value: stats.totalProducts.toString(), icon: Package, color: '#9B8FC0' },
  ];

  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Tilago — Dashboard Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value']],
      body: [
        ['Total Revenue', formatPriceAscii(stats.totalRevenue)],
        ['Total Orders', stats.totalOrders.toString()],
        ['Total Users', stats.totalUsers.toString()],
        ['Total Products', stats.totalProducts.toString()],
      ],
      theme: 'grid',
    });
    doc.save('tilago-report.pdf');
  };

  const exportExcel = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const data = [
      ['Metric', 'Value'],
      ['Total Revenue', stats.totalRevenue],
      ['Total Orders', stats.totalOrders],
      ['Total Users', stats.totalUsers],
      ['Total Products', stats.totalProducts],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Dashboard');
    XLSX.writeFile(wb, 'tilago-report.xlsx');
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-orbitron font-bold text-3xl gradient-text">Admin Dashboard</h1>
            <p className="text-text-muted text-sm mt-1">Tilago analytics & management</p>
          </div>
          <div className="flex gap-3 flex-wrap justify-end">
            <button onClick={exportExcel}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass-card hover:bg-accent-deep/20 transition-all">
              <FileSpreadsheet size={16} className="text-green-400" /> Excel
            </button>
            <button onClick={exportPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass-card hover:bg-accent-deep/20 transition-all">
              <Download size={16} className="text-red-400" /> PDF
            </button>
            <button onClick={toggleStore} disabled={toggling}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: storePaused ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)', border: `1px solid ${storePaused ? '#2ecc71' : '#e74c3c'}`, color: storePaused ? '#2ecc71' : '#e74c3c' }}>
              <Power size={16} />
              {toggling ? '...' : storePaused ? 'تشغيل المتجر' : 'إيقاف المتجر'}
            </button>
            <button onClick={() => setShowMsgInput(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass-card hover:bg-accent-deep/20 transition-all text-text-muted">
              رسالة الإيقاف
            </button>
          </div>
        </div>

        {/* Store pause message editor */}
        {showMsgInput && (
          <div className="mb-6 glass-card p-4 rounded-2xl flex gap-3 items-center">
            <input
              value={pauseMessage}
              onChange={e => setPauseMessage(e.target.value)}
              className="flex-1 bg-transparent border border-accent-deep/40 rounded-xl px-4 py-2 text-text-primary text-sm outline-none"
              placeholder="رسالة الإيقاف للعملاء..."
              dir="rtl"
            />
            <button onClick={saveMessage} className="px-4 py-2 rounded-xl text-sm font-bold bg-accent-deep text-white">حفظ</button>
          </div>
        )}

        {/* Store paused banner */}
        {storePaused && (
          <div className="mb-6 p-4 rounded-2xl text-center font-bold text-sm" style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.4)', color: '#e74c3c' }} dir="rtl">
            ⚠️ المتجر موقوف حالياً — العملاء يشوفون: &quot;{pauseMessage}&quot;
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${card.color}20` }}>
                  <card.icon size={20} style={{ color: card.color }} />
                </div>
              </div>
              <p className="text-text-muted text-xs uppercase tracking-wider mb-1">{card.label}</p>
              <p className="font-orbitron font-bold text-2xl text-text-primary">{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Revenue chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass-card p-6 rounded-2xl md:col-span-2">
            <h2 className="font-bold text-text-primary mb-4">Revenue Over Time</h2>
            {stats.revenueByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={stats.revenueByMonth}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5416B5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#5416B5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: '#9B8FC0', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9B8FC0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v} ج.م`} />
                  <Tooltip contentStyle={{ background: '#0C0516', border: '1px solid #5416B5', borderRadius: 8 }} labelStyle={{ color: '#F0E6FF' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#5416B5" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center text-text-muted">No order data yet</div>
            )}
          </motion.div>

          {/* Payment method pie */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="glass-card p-6 rounded-2xl">
            <h2 className="font-bold text-text-primary mb-4">Payments by Method</h2>
            {stats.paymentsByMethod.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stats.paymentsByMethod} dataKey="count" nameKey="method" cx="50%" cy="50%" outerRadius={80} label={({ method }) => method}>
                    {stats.paymentsByMethod.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0C0516', border: '1px solid #5416B5', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center text-text-muted">No data yet</div>
            )}
          </motion.div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'تعديل الصفحة الرئيسية', href: '/admin/home',     color: '#9B59D0' },
            { label: 'إدارة الأليرتات',   href: '/admin/alerts',       color: '#c084f5' },
            { label: 'Manage Products', href: '/admin/products',       color: '#5416B5' },
            { label: 'Manage Videos',   href: '/admin/videos',         color: '#9B59D0' },
            { label: 'Manage Stream',   href: '/admin/stream',         color: '#3AA1A1' },
            { label: 'إدارة تأثيرات 3D', href: '/admin/3d',            color: '#5EC8F0' },
            { label: 'إدارة صفحة المطوّر', href: '/admin/developer',   color: '#c084f5' },
            { label: 'View Orders',     href: '/admin/orders',         color: '#F0830B' },
            { label: 'Manage Users',    href: '/admin/users',          color: '#7F3AA1' },
            { label: 'PUBG Championship', href: '/admin/esports/pubg', color: '#FFD700' },
            { label: 'TDM Esports',       href: '/admin/esports/tdm',  color: '#3AA1A1' },
          ].map(({ label, href, color }) => (
            <a key={label} href={href}
              className="glass-card p-4 rounded-xl text-center text-sm font-medium hover:scale-105 transition-transform"
              style={{ color }}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

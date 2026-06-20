'use client';

import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Users, Package, Download, FileSpreadsheet } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DashboardStats } from '@/types';
import { formatPrice } from '@/lib/utils';

interface Props { stats: DashboardStats; }

const COLORS = ['#5416B5', '#7F3AA1', '#F0830B', '#9B8FC0'];

export function AdminDashboard({ stats }: Props) {
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
        ['Total Revenue', formatPrice(stats.totalRevenue)],
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
          <div className="flex gap-3">
            <button onClick={exportExcel}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass-card hover:bg-accent-deep/20 transition-all">
              <FileSpreadsheet size={16} className="text-green-400" /> Excel
            </button>
            <button onClick={exportPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass-card hover:bg-accent-deep/20 transition-all">
              <Download size={16} className="text-red-400" /> PDF
            </button>
          </div>
        </div>

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
                  <YAxis tick={{ fill: '#9B8FC0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip contentStyle={{ background: '#0C0516', border: '1px solid #5416B5', borderRadius: 8 }} labelStyle={{ color: '#F0E6FF' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#5416B5" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center text-text-muted">No order data yet</div>
            )}
          </motion.div>

          {/* Category pie */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="glass-card p-6 rounded-2xl">
            <h2 className="font-bold text-text-primary mb-4">Orders by Category</h2>
            {stats.ordersByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stats.ordersByCategory} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category }) => category.replace('_', ' ')}>
                    {stats.ordersByCategory.map((_, index) => (
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Manage Products', href: '/admin/products', color: '#5416B5' },
            { label: 'View Orders', href: '/admin/orders', color: '#F0830B' },
            { label: 'Manage Users', href: '/admin/users', color: '#7F3AA1' },
            { label: 'Upload Media', href: '/admin/upload', color: '#9B8FC0' },
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

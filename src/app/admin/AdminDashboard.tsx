'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import type { DashboardStats } from '@/types';
import { formatPrice, formatPriceAscii } from '@/lib/utils';

interface Props { stats: DashboardStats; }

/* ── ألوان الرسوم ───────────────────────────────────────────
   دي مش ألوان البراند. البنفسجيتين (#7F3AA1 / #5416B5) اتقاسوا
   وطلعوا غير قابلين للتمييز عن بعض في رسم بياني (ΔE 5.4 لعمى الألوان،
   و11.4 حتى بنظر سليم). الألوان دي اتولّدت واتأكدت بأداة قياس على
   خلفية #0F083B وعدّت كل الفحوصات: نطاق الإضاءة، التشبّع،
   الفصل لعمى الألوان، والتباين مع الخلفية. الترتيب ثابت — مايتقلبش. */
const SERIES = ['#9A63C9', '#D97706', '#12A5C0'] as const;

const METHOD_LABEL: Record<string, string> = {
  paymob: 'بايموب (كارت/ميزة)',
  PayPal: 'باي بال',
  paypal: 'باي بال',
  InstaPay: 'إنستاباي',
  'Vodafone Cash': 'فودافون كاش',
  Fawry: 'فوري',
  stripe: 'سترايب',
};
const methodLabel = (m: string) => METHOD_LABEL[m] ?? m;

const DELIVERY = {
  pending:     { label: 'قيد المراجعة', color: '#F0A030' },
  in_progress: { label: 'جارٍ التنفيذ',  color: '#12A5C0' },
  delivered:   { label: 'تم التسليم',    color: '#2ECC71' },
} as const;
const delivery = (s: string) => DELIVERY[s as keyof typeof DELIVERY] ?? DELIVERY.pending;

/* أقسام الإدارة — مجمّعة بدل شبكة مسطّحة من 11 رابط */
const SECTIONS = [
  {
    title: 'المتجر',
    icon: 'fa-store',
    links: [
      { label: 'الأليرتات',     href: '/admin/alerts',    icon: 'fa-bell' },
      { label: 'الستريم',       href: '/admin/stream',    icon: 'fa-video' },
      { label: 'ثري دي',        href: '/admin/3d',        icon: 'fa-cube' },
      { label: 'الفيديوهات',    href: '/admin/videos',    icon: 'fa-film' },
      { label: 'كل المنتجات',   href: '/admin/products',  icon: 'fa-box' },
    ],
  },
  {
    title: 'الإيسبورتس',
    icon: 'fa-trophy',
    links: [
      { label: 'بطولة ببجي',    href: '/admin/esports/pubg', icon: 'fa-crosshairs' },
      { label: 'TDM',           href: '/admin/esports/tdm',  icon: 'fa-gamepad' },
    ],
  },
  {
    title: 'الصفحات',
    icon: 'fa-pen-ruler',
    links: [
      { label: 'الصفحة الرئيسية', href: '/admin/home',      icon: 'fa-house' },
      { label: 'صفحة المطوّر',    href: '/admin/developer', icon: 'fa-code' },
    ],
  },
  {
    title: 'العملاء',
    icon: 'fa-users',
    links: [
      { label: 'الطلبات',       href: '/admin/orders', icon: 'fa-receipt' },
      { label: 'المستخدمون',    href: '/admin/users',  icon: 'fa-user-gear' },
    ],
  },
];

export function AdminDashboard({ stats }: Props) {
  const [storePaused, setStorePaused] = useState(false);
  const [pauseMessage, setPauseMessage] = useState('المتجر مغلق مؤقتاً، سيعود قريباً.');
  const [toggling, setToggling] = useState(false);
  const [showMsgInput, setShowMsgInput] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      if (d.storePaused === 'true') setStorePaused(true);
      if (d.pauseMessage) setPauseMessage(d.pauseMessage);
    }).catch(() => {});
  }, []);

  const toggleStore = async () => {
    setToggling(true);
    const next = !storePaused;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storePaused: next, pauseMessage }),
      });
      if (!res.ok) { alert(`فشل تغيير حالة المتجر (رمز ${res.status})`); return; }
      setStorePaused(next);
    } catch { alert('تعذّر الاتصال بالسيرفر، حاول تاني.'); }
    finally { setToggling(false); }
  };

  const saveMessage = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pauseMessage }),
      });
      if (!res.ok) { alert('فشل حفظ الرسالة.'); return; }
      setSaved(true); setTimeout(() => { setSaved(false); setShowMsgInput(false); }, 1200);
    } catch { alert('تعذّر الاتصال بالسيرفر.'); }
  };

  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Tilago - Dashboard Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 20, 32);
    autoTable(doc, {
      startY: 44,
      head: [['Metric', 'Value']],
      body: [
        ['Total Revenue', formatPriceAscii(stats.totalRevenue)],
        ['Total Orders', String(stats.totalOrders)],
        ['Awaiting Delivery', String(stats.pendingDelivery)],
        ['Total Users', String(stats.totalUsers)],
        ['Total Products', String(stats.totalProducts)],
      ],
      theme: 'grid',
    });
    doc.save('tilago-report.pdf');
  };

  const exportExcel = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['المؤشر', 'القيمة'],
      ['إجمالي الإيراد', stats.totalRevenue],
      ['عدد الطلبات', stats.totalOrders],
      ['بانتظار التسليم', stats.pendingDelivery],
      ['المستخدمون', stats.totalUsers],
      ['المنتجات', stats.totalProducts],
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'الملخص');
    XLSX.writeFile(wb, 'tilago-report.xlsx');
  };

  // اتجاه الإيراد: آخر 30 يوم مقابل الـ30 اللي قبلهم
  const trend = useMemo(() => {
    const { revenueLast30: a, revenuePrev30: b } = stats;
    if (!b) return a > 0 ? { pct: 100, up: true } : null;
    const pct = Math.round(((a - b) / b) * 100);
    return { pct: Math.abs(pct), up: pct >= 0 };
  }, [stats]);

  const methodTotal = stats.paymentsByMethod.reduce((s, m) => s + m.count, 0);

  return (
    <div className="ad" dir="rtl">
      <style>{`
        .ad{
          --v:#7F3AA1; --d:#5416B5; --bg1:#0F083B; --bg2:#0C0516;
          --ink:#EDE9F7;
          --ink-70:rgba(237,233,247,.70); --ink-50:rgba(237,233,247,.50); --ink-35:rgba(237,233,247,.35);
          --line:rgba(127,58,161,.26);
          --panel:rgba(20,12,52,.62);
          --sunk:rgba(12,5,22,.5);
          /* كثافة لوحة تحكم: 8→32px */
          --s1:8px; --s2:12px; --s3:16px; --s4:24px; --s5:32px;
          min-height:100vh;padding:calc(var(--s5) + 40px) var(--s4) var(--s5);
          background:linear-gradient(180deg,var(--bg1),var(--bg2));
          color:var(--ink-70);font-family:'Cairo','29LtBukra','Montserrat',sans-serif;
        }
        .ad-in{max-width:1180px;margin:0 auto;display:flex;flex-direction:column;gap:var(--s4);}

        /* ── Header ── */
        .ad-top{display:flex;align-items:flex-end;justify-content:space-between;gap:var(--s3);flex-wrap:wrap;}
        .ad-h1{font-family:'Oxanium','29LtBukra',sans-serif;font-weight:900;
          font-size:clamp(1.5rem,3vw,2rem);color:var(--ink);margin:0;line-height:1.2;}
        .ad-sub{font-size:.84rem;color:var(--ink-50);margin:6px 0 0;}
        .ad-acts{display:flex;gap:var(--s1);flex-wrap:wrap;}
        .ad-btn{display:inline-flex;align-items:center;gap:7px;min-height:44px;padding:0 var(--s3);
          border-radius:11px;cursor:pointer;font-family:'Cairo',sans-serif;font-size:.84rem;font-weight:700;
          background:transparent;border:1px solid var(--line);color:var(--ink-70);
          transition:background .2s,border-color .2s,color .2s;}
        .ad-btn:hover{background:rgba(84,22,181,.22);border-color:var(--v);color:var(--ink);}
        .ad-btn:focus-visible{outline:2px solid var(--v);outline-offset:2px;}
        .ad-btn.live{border-color:rgba(231,76,60,.45);color:#ff9b8f;}
        .ad-btn.live:hover{background:rgba(231,76,60,.14);}
        .ad-btn.paused{border-color:rgba(46,204,113,.45);color:#7ef0a8;}
        .ad-btn.paused:hover{background:rgba(46,204,113,.14);}

        /* ── بانر الإيقاف ── */
        .ad-banner{display:flex;align-items:center;gap:var(--s2);padding:var(--s2) var(--s3);
          border-radius:12px;background:rgba(231,76,60,.09);border:1px solid rgba(231,76,60,.4);
          color:#ff9b8f;font-size:.85rem;font-weight:700;}
        .ad-msgbox{display:flex;gap:var(--s1);align-items:center;flex-wrap:wrap;
          padding:var(--s2);border-radius:12px;background:var(--panel);border:1px solid var(--line);}
        .ad-msgbox input{flex:1;min-width:220px;min-height:44px;padding:0 var(--s2);border-radius:9px;
          background:var(--sunk);border:1px solid var(--line);color:var(--ink);
          font-family:'Cairo',sans-serif;font-size:.85rem;outline:none;}
        .ad-msgbox input:focus{border-color:var(--v);}

        /* ── KPI ── */
        .ad-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:var(--s2);}
        @media(max-width:900px){.ad-kpis{grid-template-columns:repeat(2,1fr);}}
        .ad-kpi{background:var(--panel);border:1px solid var(--line);border-radius:16px;
          padding:var(--s3);display:flex;flex-direction:column;gap:6px;position:relative;overflow:hidden;}
        .ad-kpi.hero{grid-column:span 2;}
        @media(max-width:900px){.ad-kpi.hero{grid-column:span 2;}}
        .ad-kpi-l{display:flex;align-items:center;gap:7px;font-size:.78rem;color:var(--ink-50);font-weight:700;}
        .ad-kpi-l i{color:var(--v);font-size:.8rem;}
        .ad-kpi-v{font-family:'Oxanium',sans-serif;font-weight:800;color:var(--ink);
          font-size:1.7rem;line-height:1.1;font-variant-numeric:tabular-nums;}
        .ad-kpi.hero .ad-kpi-v{font-size:clamp(2rem,4.4vw,3rem);}
        .ad-kpi-note{font-size:.74rem;color:var(--ink-35);}
        .ad-trend{display:inline-flex;align-items:center;gap:5px;font-size:.76rem;font-weight:700;
          padding:.16rem .5rem;border-radius:50px;width:fit-content;}
        .ad-trend.up{background:rgba(46,204,113,.14);color:#7ef0a8;}
        .ad-trend.down{background:rgba(231,76,60,.14);color:#ff9b8f;}
        /* الطلبات المنتظرة — الرقم الوحيد اللي بيتطلب تصرّف */
        .ad-kpi.act{border-color:rgba(240,160,48,.4);background:rgba(240,160,48,.06);}
        .ad-kpi.act .ad-kpi-l i,.ad-kpi.act .ad-kpi-v{color:#F0A030;}
        /* هدف لمس كامل 44px — كان سطر نص ارتفاعه 19px */
        .ad-kpi-go{margin-top:2px;display:inline-flex;align-items:center;gap:6px;min-height:44px;
          padding:0 var(--s2);border-radius:10px;width:fit-content;
          background:rgba(240,160,48,.12);border:1px solid rgba(240,160,48,.4);
          font-size:.78rem;color:#F0A030;text-decoration:none;font-weight:700;transition:background .2s;}
        .ad-kpi-go:hover{background:rgba(240,160,48,.24);}
        .ad-kpi-go:focus-visible{outline:2px solid #F0A030;outline-offset:2px;}

        /* ── ألواح ── */
        .ad-cols{display:grid;grid-template-columns:1.5fr 1fr;gap:var(--s2);align-items:start;}
        @media(max-width:900px){.ad-cols{grid-template-columns:1fr;}}
        .ad-card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:var(--s3);}
        .ad-card-h{display:flex;align-items:baseline;justify-content:space-between;gap:var(--s2);margin-bottom:var(--s3);}
        .ad-card-t{font-family:'Oxanium','29LtBukra',sans-serif;font-size:1rem;font-weight:800;color:var(--ink);margin:0;}
        .ad-card-s{font-size:.74rem;color:var(--ink-35);}
        .ad-empty{min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:8px;color:var(--ink-35);font-size:.84rem;}
        .ad-empty i{font-size:1.6rem;opacity:.5;}

        /* ── شريط طرق الدفع (نسبة من كل) ── */
        .ad-bar{display:flex;height:14px;border-radius:7px;overflow:hidden;gap:2px;background:var(--sunk);}
        .ad-bar span{height:100%;}
        .ad-bar span:first-child{border-radius:0 7px 7px 0;}
        .ad-bar span:last-child{border-radius:7px 0 0 7px;}
        .ad-legend{display:flex;flex-direction:column;gap:var(--s1);margin-top:var(--s3);}
        .ad-leg{display:flex;align-items:center;gap:8px;font-size:.82rem;}
        .ad-leg-dot{width:10px;height:10px;border-radius:3px;flex-shrink:0;}
        .ad-leg-n{flex:1;color:var(--ink-70);}
        .ad-leg-v{font-family:'Oxanium',sans-serif;font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums;}
        .ad-leg-p{color:var(--ink-35);font-size:.76rem;min-width:38px;text-align:left;
          font-family:'Oxanium',sans-serif;font-variant-numeric:tabular-nums;}

        /* ── أحدث الطلبات ── */
        .ad-rows{display:flex;flex-direction:column;}
        .ad-row{display:flex;align-items:center;gap:var(--s2);padding:var(--s2) 0;
          border-bottom:1px solid rgba(127,58,161,.14);}
        .ad-row:last-child{border-bottom:none;}
        .ad-row-m{flex:1;min-width:0;}
        .ad-row-t{font-size:.86rem;color:var(--ink);font-weight:700;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .ad-row-s{font-size:.72rem;color:var(--ink-35);margin-top:2px;}
        .ad-row-a{font-family:'Oxanium',sans-serif;font-weight:700;color:var(--ink);
          font-size:.86rem;white-space:nowrap;font-variant-numeric:tabular-nums;}
        .ad-chip{display:inline-flex;align-items:center;gap:5px;font-size:.7rem;font-weight:700;
          padding:.18rem .55rem;border-radius:50px;white-space:nowrap;}
        .ad-chip i{font-size:.6rem;}

        /* ── أقسام الإدارة ── */
        .ad-sec{display:flex;flex-direction:column;gap:var(--s2);}
        .ad-sec-t{display:flex;align-items:center;gap:8px;font-size:.8rem;font-weight:800;
          color:var(--ink-50);letter-spacing:.5px;}
        .ad-sec-t i{color:var(--v);}
        .ad-links{display:grid;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));gap:var(--s1);}
        .ad-link{display:flex;align-items:center;gap:10px;min-height:52px;padding:0 var(--s2);
          border-radius:12px;background:var(--sunk);border:1px solid var(--line);
          color:var(--ink-70);text-decoration:none;font-size:.86rem;font-weight:700;
          transition:background .2s,border-color .2s,color .2s;}
        .ad-link:hover{background:rgba(84,22,181,.24);border-color:var(--v);color:var(--ink);}
        .ad-link:focus-visible{outline:2px solid var(--v);outline-offset:2px;}
        .ad-link i{color:var(--v);font-size:.95rem;width:18px;text-align:center;flex-shrink:0;}

        /* ── ظهور متدرّج عند التحميل ── */
        .ad-rise{opacity:0;transform:translateY(10px);animation:adRise .38s cubic-bezier(.25,.8,.25,1) forwards;}
        @keyframes adRise{to{opacity:1;transform:none;}}
        @media(prefers-reduced-motion:reduce){
          .ad-rise{animation:none;opacity:1;transform:none;}
        }
        @media(max-width:560px){
          .ad{padding-left:var(--s2);padding-right:var(--s2);}
          .ad-kpis{grid-template-columns:1fr;}
          .ad-kpi.hero{grid-column:span 1;}
        }
      `}</style>

      <div className="ad-in">
        {/* Header */}
        <header className="ad-top ad-rise">
          <div>
            <h1 className="ad-h1">لوحة التحكم</h1>
            <p className="ad-sub">كل أرقام المتجر وأقسامه في مكان واحد</p>
          </div>
          <div className="ad-acts">
            <button className="ad-btn" onClick={exportExcel}><i className="fas fa-file-excel" /> Excel</button>
            <button className="ad-btn" onClick={exportPDF}><i className="fas fa-file-pdf" /> PDF</button>
            <button className="ad-btn" onClick={() => setShowMsgInput(v => !v)}>
              <i className="fas fa-message" /> رسالة الإيقاف
            </button>
            <button className={`ad-btn ${storePaused ? 'paused' : 'live'}`} onClick={toggleStore} disabled={toggling}>
              <i className={`fas ${storePaused ? 'fa-play' : 'fa-pause'}`} />
              {toggling ? '...' : storePaused ? 'تشغيل المتجر' : 'إيقاف المتجر'}
            </button>
          </div>
        </header>

        {showMsgInput && (
          <div className="ad-msgbox">
            <input value={pauseMessage} onChange={e => setPauseMessage(e.target.value)}
              placeholder="الرسالة اللي هتظهر للعميل وقت الإيقاف…" aria-label="رسالة الإيقاف" />
            <button className="ad-btn" onClick={saveMessage}>{saved ? '✓ اتحفظت' : 'حفظ'}</button>
          </div>
        )}

        {storePaused && (
          <div className="ad-banner">
            <i className="fas fa-circle-pause" />
            المتجر موقوف — العميل بيشوف: «{pauseMessage}»
          </div>
        )}

        {/* KPI */}
        <section className="ad-kpis ad-rise" style={{ animationDelay: '.04s' }} aria-label="الأرقام الأساسية">
          <div className="ad-kpi hero">
            <span className="ad-kpi-l"><i className="fas fa-wallet" /> إجمالي الإيراد</span>
            <span className="ad-kpi-v">{formatPrice(stats.totalRevenue)}</span>
            {trend
              ? <span className={`ad-trend ${trend.up ? 'up' : 'down'}`}>
                  <i className={`fas fa-arrow-${trend.up ? 'up' : 'down'}`} />
                  {trend.pct}% عن الـ30 يوم اللي فاتوا
                </span>
              : <span className="ad-kpi-note">لسه مفيش بيانات كفاية للمقارنة</span>}
          </div>

          <div className={`ad-kpi${stats.pendingDelivery > 0 ? ' act' : ''}`}>
            <span className="ad-kpi-l"><i className="fas fa-hourglass-half" /> بانتظار التسليم</span>
            <span className="ad-kpi-v">{stats.pendingDelivery}</span>
            {stats.pendingDelivery > 0
              ? <Link href="/admin/orders" className="ad-kpi-go">سلّمها الآن ←</Link>
              : <span className="ad-kpi-note">كل الطلبات اتسلّمت ✓</span>}
          </div>

          <div className="ad-kpi">
            <span className="ad-kpi-l"><i className="fas fa-receipt" /> عدد الطلبات</span>
            <span className="ad-kpi-v">{stats.totalOrders}</span>
            <span className="ad-kpi-note">{stats.totalUsers} مستخدم · {stats.totalProducts} منتج</span>
          </div>
        </section>

        {/* Charts */}
        <section className="ad-cols">
          <div className="ad-card ad-rise" style={{ animationDelay: '.08s' }}>
            <div className="ad-card-h">
              <h2 className="ad-card-t">الإيراد شهرياً</h2>
              <span className="ad-card-s">بالجنيه</span>
            </div>
            {stats.revenueByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={stats.revenueByMonth} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                  <defs>
                    <linearGradient id="adRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SERIES[0]} stopOpacity={0.34} />
                      <stop offset="100%" stopColor={SERIES[0]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  {/* شبكة خافتة — الخطوط مايتنافسوش مع البيانات */}
                  <CartesianGrid stroke="rgba(237,233,247,.07)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(237,233,247,.5)', fontSize: 11 }}
                    axisLine={false} tickLine={false} reversed />
                  <YAxis tick={{ fill: 'rgba(237,233,247,.5)', fontSize: 11 }}
                    axisLine={false} tickLine={false} width={44} orientation="right"
                    /* التقريب لأقرب ألف كان بيطلع علامتين "2k" على المحور (1500 و2000).
                       نعرض كسر عشري لما الرقم مش ألف كامل. */
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : String(v)} />
                  <Tooltip
                    cursor={{ stroke: 'rgba(237,233,247,.25)', strokeWidth: 1 }}
                    contentStyle={{ background: '#0C0516', border: '1px solid rgba(127,58,161,.5)',
                      borderRadius: 10, direction: 'rtl', fontFamily: 'Cairo, sans-serif', fontSize: 13 }}
                    labelStyle={{ color: '#EDE9F7', fontWeight: 700 }}
                    formatter={(v: number) => [formatPrice(v), 'الإيراد']} />
                  {/* خط 2px + نقاط 8px عند الـ hover حسب مواصفات العلامات */}
                  <Area type="monotone" dataKey="revenue" stroke={SERIES[0]} strokeWidth={2}
                    fill="url(#adRev)" activeDot={{ r: 4, strokeWidth: 2, stroke: '#0C0516' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="ad-empty"><i className="fas fa-chart-area" /><span>لسه مفيش مدفوعات</span></div>
            )}
          </div>

          <div className="ad-card ad-rise" style={{ animationDelay: '.12s' }}>
            <div className="ad-card-h">
              <h2 className="ad-card-t">طرق الدفع</h2>
              <span className="ad-card-s">{methodTotal} عملية</span>
            </div>
            {methodTotal > 0 ? (
              <>
                {/* نسبة من كل = شريط مكدّس، مش رسم دائري */}
                <div className="ad-bar" role="img"
                  aria-label={stats.paymentsByMethod.map(m => `${methodLabel(m.method)}: ${m.count}`).join('، ')}>
                  {stats.paymentsByMethod.slice(0, 3).map((m, i) => (
                    <span key={m.method} style={{
                      width: `${(m.count / methodTotal) * 100}%`, background: SERIES[i],
                    }} />
                  ))}
                </div>
                {/* الهوية باسم مكتوب مش بلون لوحده */}
                <div className="ad-legend">
                  {stats.paymentsByMethod.slice(0, 3).map((m, i) => (
                    <div key={m.method} className="ad-leg">
                      <span className="ad-leg-dot" style={{ background: SERIES[i] }} />
                      <span className="ad-leg-n">{methodLabel(m.method)}</span>
                      <span className="ad-leg-v">{m.count}</span>
                      <span className="ad-leg-p">{Math.round((m.count / methodTotal) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="ad-empty"><i className="fas fa-credit-card" /><span>لسه مفيش مدفوعات</span></div>
            )}
          </div>
        </section>

        {/* أحدث الطلبات */}
        <section className="ad-card ad-rise" style={{ animationDelay: '.16s' }}>
          <div className="ad-card-h">
            <h2 className="ad-card-t">أحدث الطلبات</h2>
            <Link href="/admin/orders" className="ad-card-s" style={{ color: 'var(--ink-50)' }}>عرض الكل ←</Link>
          </div>
          {stats.recentOrders.length > 0 ? (
            <div className="ad-rows">
              {stats.recentOrders.map(o => {
                const d = delivery(o.deliveryStatus);
                return (
                  <div key={o.id} className="ad-row">
                    <div className="ad-row-m">
                      <div className="ad-row-t">{o.productName ?? 'طلب'}</div>
                      <div className="ad-row-s">
                        {o.userName ?? 'عميل'} · {methodLabel(o.method)} ·{' '}
                        {new Date(o.createdAt).toLocaleDateString('ar-EG')}
                      </div>
                    </div>
                    <span className="ad-row-a">{formatPrice(o.amount)}</span>
                    <span className="ad-chip" style={{
                      background: `${d.color}1f`, color: d.color, border: `1px solid ${d.color}55`,
                    }}>
                      <i className="fas fa-circle" /> {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="ad-empty"><i className="fas fa-inbox" /><span>لسه مفيش طلبات</span></div>
          )}
        </section>

        {/* الأقسام */}
        {SECTIONS.map((s, si) => (
          <section key={s.title} className="ad-sec ad-rise" style={{ animationDelay: `${0.2 + si * 0.04}s` }}>
            <h2 className="ad-sec-t"><i className={`fas ${s.icon}`} /> {s.title}</h2>
            <div className="ad-links">
              {s.links.map(l => (
                <Link key={l.href} href={l.href} className="ad-link">
                  <i className={`fas ${l.icon}`} /> {l.label}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Home, Layers, Palette, MonitorPlay, HelpCircle,
  Copy, Check, Play, Gift, Trophy, Target, Frame, Menu, X,
  Sparkles, ShieldCheck, Zap, LogIn, Link2, RefreshCw, Smartphone,
  Wand2, Clock, Headphones, Activity, Crown, BarChart3, Hourglass,
} from 'lucide-react';
import {
  CheckoutModal, PALETTES, PLANS, PaidBanner, isNew, paletteFromTheme, previewSrc,
  type AppOverlay, type AppSub, type OverlayCategory, type Plan,
} from './shared';

/* ── ثوابت ──────────────────────────────────────────────────── */

const CATS: { key: OverlayCategory; name: string; Icon: typeof Gift }[] = [
  { key: 'SUPPORTERS', name: 'داعمين', Icon: Gift },
  { key: 'CHALLENGES', name: 'تحديات', Icon: Trophy },
  { key: 'GOALS',      name: 'أهداف',  Icon: Target },
  { key: 'DECOR',      name: 'تزيين',  Icon: Frame },
];

const PLAN_NAME: Record<string, string> = { m1: 'شهري', m3: '3 شهور', y: 'سنوي' };

const PERKS = [
  'كل التركيبات في المكتبة',
  'الجديد أول ما ينزل',
  'ألوانك على كل تركيبة',
  'ألوانك محفوظة على حسابك',
  'دعم لما تحتاجه',
];

/* اللي بيميّزنا — مكتوب بلغة العميل مش بلغة الكود */
const FEATURES = [
  { Icon: Play,        t: 'معاينة قبل ما تدفع',  d: 'كل تركيبة شغّالة قدامك في الصفحة، تشوفها بعينك قبل الاشتراك.' },
  { Icon: Smartphone,  t: 'ألوانك على كل حاجة',  d: 'تختار لونك مرة واحدة من حسابك، وبيتطبّق على كل روابطك.' },
  { Icon: Link2,       t: 'رابط واحد وخلاص',     d: 'مفيش برنامج تنزّله ولا تحذير من ويندوز. تنسخ الرابط وتلزقه.' },
  { Icon: Wand2,       t: 'تصميمات حصرية',       d: 'كل تركيبة مصمّمة عندنا من الصفر، مش قوالب متكررة.' },
  { Icon: RefreshCw,   t: 'مكتبة بتكبر',          d: 'تركيبات جديدة كل أسبوع، وبتوصلك من غير أي دفع زيادة.' },
  { Icon: ShieldCheck, t: 'مفيش مربع أبيض',      d: 'لو اشتراكك خلص وانت لايف، التركيبة بتختفي بهدوء قدام جمهورك.' },
  { Icon: Clock,       t: 'دفع آمن',             d: 'فيزا وميزا عن طريق بايموب، أو بايبال.' },
  { Icon: Headphones,  t: 'دعم حقيقي',           d: 'لو وقفت في أي خطوة، فيه حد يرد عليك مش رد آلي.' },
];

const FAQ = [
  { q: 'إزاي بحطها في OBS؟',
    a: 'بتنسخ الرابط من قسم التركيبات، وتضيف Browser Source جديد في OBS، وتلزقه. العملية بتاخد أقل من دقيقة، ومفيش أي تنصيب.' },
  { q: 'محتاج أنزّل برنامج؟',
    a: 'لا. التركيبة بتشتغل من الرابط مباشرة جوه OBS. مفيش ملف تنزّله ولا تحذير من ويندوز.' },
  { q: 'أقدر أغيّر الألوان بعد التركيب؟',
    a: 'أيوه، والرابط مابيتغيّرش. غيّر اللون من قسم الألوان حتى من موبايلك وانت لايف، والتركيبة بتتحدّث على البث.' },
  { q: 'التركيبات الجديدة بتوصلني إزاي؟',
    a: 'بتلاقيها في قسم التركيبات أول ما تنزل. الاشتراك بياخد كل المكتبة، القديم والجديد.' },
  { q: 'لو الاشتراك خلص وأنا بابث؟',
    a: 'التركيبة بتتحول لشفافة وبتظهر رسالة صغيرة ليك انت بس. جمهورك مش هيشوف مربع أبيض ولا خطأ.' },
  { q: 'ينفع أشارك حسابي؟',
    a: 'الحساب لبث واحد في نفس الوقت. ده بيحمي اشتراكك من إنه يتستخدم من غير علمك.' },
] as const;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });

const daysLeft = (iso: string | null) =>
  iso ? Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000) : null;

type SectionKey =
  | 'home' | 'overlays' | 'theme' | 'install' | 'help'
  | 'events' | 'stats' | 'top' | 'goals' | 'actions';

const NAV: { key: SectionKey; name: string; Icon: typeof Layers; soon?: boolean }[] = [
  { key: 'home',     name: 'الرئيسية',  Icon: Home },
  { key: 'overlays', name: 'التركيبات', Icon: Layers },
  { key: 'theme',    name: 'الألوان',   Icon: Palette },
  { key: 'events',   name: 'الأحداث',   Icon: Activity,     soon: true },
  { key: 'top',      name: 'التوب',     Icon: Crown,        soon: true },
  { key: 'goals',    name: 'الأهداف',   Icon: Target,       soon: true },
  { key: 'actions',  name: 'الأوامر',   Icon: Zap,          soon: true },
  { key: 'stats',    name: 'إحصائيات',  Icon: BarChart3,    soon: true },
  { key: 'install',  name: 'التركيب',   Icon: MonitorPlay },
  { key: 'help',     name: 'مساعدة',    Icon: HelpCircle },
];

/* الأقسام اللي مستنية سيرفر أحداث تيك توك. بنعرضها بصراحة إنها لسه
   بتتجهّز بدل ما نملاها بأرقام وهمية تكدب على العميل. */
const SOON: Record<string, { title: string; lead: string; points: string[] }> = {
  events: {
    title: 'الأحداث',
    lead: 'كل هدية ومتابع وتعليق بيحصل في بثك، يظهر هنا لحظة بلحظة.',
    points: ['تشوف مين بعتلك إيه وامتى', 'تراجع البث اللي فات', 'تبني عليه تحديات وأهداف'],
  },
  top: {
    title: 'التوب',
    lead: 'ترتيب أكتر ناس بتدعمك — على البث وعلى الصفحة.',
    points: ['أكبر داعم في البث الحالي', 'الترتيب العام على مدار الشهر', 'تركيبة جاهزة تعرضه على الشاشة'],
  },
  goals: {
    title: 'الأهداف',
    lead: 'حدّد هدف للمتابعين أو الهدايا، والشريط بيتحرك مع كل حدث.',
    points: ['هدف متابعين أو لايكات أو هدايا', 'الشريط بيتحدّث لوحده', 'تركيبة تحطها في OBS'],
  },
  actions: {
    title: 'الأوامر',
    lead: 'خلّي حاجة تحصل على الشاشة لما يحصل حدث معيّن في بثك.',
    points: ['هدية معيّنة تشغّل تركيبة', 'متابع جديد يطلّع تنبيه', 'تتحكم في كل حاجة من حسابك'],
  },
  stats: {
    title: 'إحصائيات',
    lead: 'أرقام بثك في مكان واحد بدل ما تفتكرها.',
    points: ['أكتر الأوقات تفاعلاً', 'مقارنة بين البثوث', 'أكتر الداعمين على المدى الطويل'],
  },
};

const HANDLE_KEY = 'tilago-tt-handle';
const HANDLE_RE = /^[A-Za-z0-9._]{2,24}$/;

/* ============================================================ */

export default function OverlayApp({
  name, email, sub, overlays,
}: {
  name: string | null; email: string | null; sub: AppSub; overlays: AppOverlay[];
}) {
  const left = daysLeft(sub?.endsAt ?? null);
  const live = sub?.status === 'active' && (left === null || left > 0);

  const [section, setSection] = useState<SectionKey>(live ? 'overlays' : 'home');
  const [menu, setMenu] = useState(false);
  const [cat, setCat] = useState<OverlayCategory | 'ALL'>('ALL');
  const [copied, setCopied] = useState<string | null>(null);
  const [tested, setTested] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  /* يوزر تيك توك — بيتحفظ على الجهاز. الربط الحي نفسه بيشتغل لما خدمة
     الأحداث تتنشر؛ لحد ساعتها الحالة بتفضل "غير متصل" بصراحة. */
  const [handle, setHandle] = useState('');
  const [handleNote, setHandleNote] = useState<string | null>(null);
  useEffect(() => {
    try { const v = localStorage.getItem(HANDLE_KEY); if (v) setHandle(v); } catch {}
  }, []);

  function saveHandle() {
    const v = handle.trim().replace(/^@/, '');
    if (!HANDLE_RE.test(v)) {
      setHandleNote('اكتب اليوزر من غير @ — حروف إنجليزي وأرقام ونقطة وشرطة سفلية');
    } else {
      setHandle(v);
      try { localStorage.setItem(HANDLE_KEY, v); } catch {}
      setHandleNote('اتحفظ. الربط الحي هيشتغل أول ما خدمة الأحداث تتفعّل');
    }
    setTimeout(() => setHandleNote(null), 4200);
  }

  const [checkout, setCheckout] = useState<Plan | null>(null);
  const openCheckout = (p: Plan) => setCheckout(p);

  const initialPalette = useMemo(() => paletteFromTheme(sub?.theme), [sub]);
  const [palette, setPalette] = useState<string>(initialPalette);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const active = useMemo(
    () => PALETTES.find(p => p.key === palette) ?? PALETTES[0], [palette],
  );
  const themeFrame = useRef<HTMLIFrameElement | null>(null);
  const cardFrames = useRef<Record<string, HTMLIFrameElement | null>>({});

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const linkFor = (o: AppOverlay) => (sub ? `${origin}/o/${sub.token}/${o.slug}` : '');

  const shown = useMemo(() => {
    const list = cat === 'ALL' ? overlays : overlays.filter(o => o.category === cat);
    return [...list].sort((a, b) =>
      Number(isNew(b.createdAt)) - Number(isNew(a.createdAt)) ||
      Number(b.featured) - Number(a.featured));
  }, [overlays, cat]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: overlays.length };
    for (const o of overlays) c[o.category] = (c[o.category] ?? 0) + 1;
    return c;
  }, [overlays]);

  const demo = useMemo(
    () => overlays.find(o => o.featured) ?? overlays[0] ?? null, [overlays],
  );

  useEffect(() => {
    themeFrame.current?.contentWindow?.postMessage(
      { type: 'plate-theme', vars: active.vars }, '*');
  }, [active, section]);

  async function saveTheme() {
    setSaving(true); setSaved(false);
    try {
      const res = await fetch('/api/account/overlay-theme', {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ theme: active.vars }),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2800); }
    } finally { setSaving(false); }
  }

  const copy = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id); setTimeout(() => setCopied(null), 2000);
    } catch { /* الرابط ظاهر في الخانة والعميل يقدر يعلّم عليه */ }
  }, []);

  /* زرار التجربة بيبعت حدث وهمي للمعاينة، فالعميل يشوف التركيبة بترد
     بعينه قبل ما يفتح OBS — ده السؤال اللي ورا معظم طلبات الاسترجاع */
  function test(o: AppOverlay) {
    cardFrames.current[o.id]?.contentWindow?.postMessage({
      type: 'plate',
      data: { key: 't' + Date.now(), label: 'تجربة', name: name || 'أهلاً بيك', value: 1250 },
    }, '*');
    setTested(o.id); setTimeout(() => setTested(null), 2200);
  }

  const steps = [
    { done: Boolean(sub),        label: 'فعّلت اشتراكك' },
    { done: Boolean(sub?.theme), label: 'اخترت ألوانك' },
    { done: overlays.length > 0, label: 'في تركيبات جاهزة' },
  ];
  const doneCount = steps.filter(s => s.done).length;

  const go = (k: SectionKey) => { setSection(k); setMenu(false); window.scrollTo({ top: 0 }); };
  const initial = (name || email || 'T').trim().charAt(0).toUpperCase();

  return (
    <div className="ovl" dir="rtl">
      <style>{`
        /* ألوان الموقع الأربعة. العمق من الحدود والتعبئة، ومفيش ولا
           box-shadow ملوّن في الملف ده. */
        .ovl{
          --deep:#0C0516; --navy:#0F083B; --grape:#5416B5; --violet:#7F3AA1;
          --ink:#ece8f7; --ink-2:#a8a1c6; --ink-3:#7d769b;
          --accent:#a36bd0;
          --line:rgba(127,58,161,.2); --line-2:rgba(127,58,161,.45);
          --panel:#110a24; --panel-2:#160e2e; --well:#0a0514;
          --ok:#4ade80; --warn:#fbbf24; --bad:#f06277;
          --side:128px; --bar:68px;
          min-height:100vh;background:var(--deep);color:var(--ink-2);
          font-family:'Cairo','29LtBukra','Montserrat',sans-serif;font-size:15px;
        }
        .ovl *{box-sizing:border-box}
        .ovl button,.ovl input{font-family:inherit}

        /* ── الشريط الجانبي: أيقونة فوق الكلمة ─────────────── */
        .ovl-side{
          position:fixed;top:0;right:0;bottom:0;width:var(--side);z-index:40;
          background:var(--panel);border-left:1px solid var(--line);
          display:flex;flex-direction:column;
        }
        .ovl-brand{
          height:var(--bar);flex:none;display:flex;flex-direction:column;
          align-items:center;justify-content:center;gap:3px;
          border-bottom:1px solid var(--line);
        }
        .ovl-brand img{height:26px;width:auto;object-fit:contain}
        .ovl-brand b{font-family:'Oxanium',sans-serif;font-size:.62rem;font-weight:700;
          letter-spacing:.12em;color:var(--ink)}
        .ovl-nav{flex:1;overflow-y:auto;padding:.7rem .55rem;display:flex;flex-direction:column;gap:.3rem}
        .ovl-nav button{
          position:relative;display:flex;flex-direction:column;align-items:center;gap:.4rem;
          width:100%;cursor:pointer;padding:.8rem .3rem;border-radius:10px;
          border:1px solid transparent;background:none;color:var(--ink-2);
          font-size:.78rem;font-weight:600;transition:background .2s,color .2s,border-color .2s;
        }
        .ovl-nav button svg{color:var(--ink-3);transition:color .2s}
        .ovl-nav button:hover{background:rgba(127,58,161,.12);color:var(--ink)}
        .ovl-nav button:hover svg{color:var(--accent)}
        .ovl-nav button[aria-current="true"]{background:rgba(127,58,161,.2);border-color:var(--line-2);color:var(--ink)}
        .ovl-nav button[aria-current="true"] svg{color:var(--accent)}
        .ovl-nav .ovl-badge{position:absolute;top:6px;left:8px;font-family:'Oxanium',sans-serif;
          font-size:.62rem;min-width:18px;height:18px;padding:0 5px;border-radius:9px;
          display:grid;place-items:center;background:var(--grape);color:#fff}
        .ovl-nav .ovl-soon{position:absolute;top:6px;left:6px;font-size:.58rem;font-weight:700;
          padding:1px 6px;border-radius:9px;background:rgba(251,191,36,.16);
          border:1px solid rgba(251,191,36,.4);color:var(--warn)}

        /* قسم لسه بيتجهّز */
        .ovl-soon-box{max-width:640px}
        .ovl-soon-box .ovl-panel{padding:1.6rem 1.4rem}
        .ovl-soon-tag{display:inline-flex;align-items:center;gap:.4rem;font-size:.78rem;font-weight:700;
          padding:.25rem .75rem;border-radius:999px;background:rgba(251,191,36,.12);
          border:1px solid rgba(251,191,36,.4);color:var(--warn);margin-bottom:1rem}
        .ovl-soon-box ul{list-style:none;margin:1.2rem 0 0;padding:0;display:grid;gap:.6rem}
        .ovl-soon-box li{display:flex;align-items:center;gap:.5rem;font-size:.88rem;color:var(--ink-2)}
        .ovl-soon-box li svg{flex:none;color:var(--accent)}
        .ovl-soon-note{margin:1.3rem 0 0;padding-top:1.1rem;border-top:1px solid var(--line);
          font-size:.84rem;line-height:1.8;color:var(--ink-3)}
        .ovl-side-foot{flex:none;padding:.7rem .5rem;border-top:1px solid var(--line);
          display:flex;flex-direction:column;gap:.1rem;text-align:center}
        .ovl-side-foot a{font-size:.72rem;color:var(--ink-3);text-decoration:none;padding:.3rem 0}
        .ovl-side-foot a:hover{color:var(--ink-2)}

        /* ── الشريط العلوي ─────────────────────────────────── */
        .ovl-main{margin-right:var(--side);min-height:100vh;display:flex;flex-direction:column}
        .ovl-bar{
          position:sticky;top:0;z-index:30;height:var(--bar);
          display:flex;align-items:center;justify-content:space-between;gap:1rem;
          padding:0 1.5rem;background:rgba(12,5,22,.94);backdrop-filter:blur(10px);
          border-bottom:1px solid var(--line);
        }
        .ovl-conn{display:flex;align-items:center;gap:.55rem;min-width:0}
        .ovl-field{display:flex;align-items:center;gap:.45rem;height:40px;padding:0 .75rem;
          background:var(--well);border:1px solid var(--line);border-radius:10px;min-width:0}
        .ovl-field:focus-within{border-color:var(--line-2)}
        .ovl-field span{font-size:.8rem;color:var(--ink-3)}
        .ovl-field input{width:150px;min-width:0;background:none;border:0;outline:0;
          color:var(--ink);font-size:.85rem;direction:ltr;text-align:left}
        .ovl-state{display:inline-flex;align-items:center;gap:.4rem;font-size:.8rem;color:var(--ink-3);white-space:nowrap}
        .ovl-dot{width:7px;height:7px;border-radius:50%;flex:none;background:var(--bad)}
        .ovl-dot.on{background:var(--ok)}
        .ovl-note{position:absolute;top:calc(var(--bar) - 4px);right:1.5rem;z-index:31;
          background:var(--panel-2);border:1px solid var(--line-2);color:var(--ink-2);
          font-size:.8rem;padding:.5rem .85rem;border-radius:9px}
        .ovl-who{display:flex;align-items:center;gap:.6rem;flex:none}
        .ovl-who small{font-size:.8rem;color:var(--ink-3);direction:ltr}
        .ovl-burger{display:none;background:none;border:1px solid var(--line);color:var(--ink-2);
          width:40px;height:40px;border-radius:10px;cursor:pointer;place-items:center}

        .ovl-body{flex:1;padding:1.8rem 1.5rem 3rem;width:100%;max-width:1180px;margin:0 auto}
        .ovl-h{margin:0 0 .3rem;font-family:'29LtBukra','Cairo',sans-serif;
          font-size:1.45rem;font-weight:700;color:var(--ink);line-height:1.5}
        .ovl-p{margin:0 0 1.6rem;font-size:.9rem;line-height:1.85;color:var(--ink-3);max-width:64ch}

        /* ── أزرار ─────────────────────────────────────────── */
        .ovl-btn{display:inline-flex;align-items:center;justify-content:center;gap:.45rem;cursor:pointer;
          height:40px;padding:0 1.15rem;font-size:.86rem;font-weight:600;border-radius:10px;
          border:1px solid transparent;background:var(--grape);color:#fff;white-space:nowrap;
          transition:background .2s,border-color .2s,color .2s;text-decoration:none}
        .ovl-btn:hover{background:var(--violet)}
        .ovl-btn:disabled{opacity:.5;cursor:not-allowed}
        .ovl-btn.ghost{background:var(--panel-2);border-color:var(--line);color:var(--ink)}
        .ovl-btn.ghost:hover{background:rgba(127,58,161,.22);border-color:var(--line-2)}
        .ovl-btn.sm{height:34px;padding:0 .8rem;font-size:.8rem;border-radius:8px}
        .ovl-btn.done{background:rgba(74,222,128,.14);border-color:rgba(74,222,128,.4);color:var(--ok)}
        .ovl-btn:focus-visible,.ovl-chip:focus-visible,.ovl-tab:focus-visible,
        .ovl-nav button:focus-visible,.ovl-q:focus-visible,.ovl-field:focus-within{
          outline:2px solid var(--accent);outline-offset:2px}

        /* ── لوحة عامة ─────────────────────────────────────── */
        .ovl-panel{background:var(--panel);border:1px solid var(--line);border-radius:14px}
        .ovl-panel-h{display:flex;align-items:center;justify-content:space-between;gap:.8rem;
          padding:.85rem 1.1rem;border-bottom:1px solid var(--line)}
        .ovl-panel-h h2{margin:0;font-size:.95rem;font-weight:700;color:var(--ink)}

        /* شاشة المعاينة فوق الرئيسية — أول حاجة الزائر يشوفها */
        .ovl-stage-wrap{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:1.6rem;
          align-items:center;margin-bottom:1.6rem}
        .ovl-hero-h{margin:0 0 .6rem;font-family:'29LtBukra','Cairo',sans-serif;font-weight:700;
          font-size:clamp(1.5rem,3vw,2.1rem);line-height:1.35;color:var(--ink)}
        .ovl-hero-h em{font-style:normal;color:var(--accent)}
        .ovl-hero-p{margin:0 0 1.1rem;font-size:.92rem;line-height:1.85;color:var(--ink-3);max-width:44ch}
        .ovl-stage{position:relative;border-radius:14px;padding:6px;
          background:linear-gradient(145deg,rgba(163,107,208,.5),rgba(84,22,181,.12) 45%,rgba(163,107,208,.3))}
        .ovl-stage .ovl-screen{border-radius:10px;overflow:hidden}
        .ovl-live{position:absolute;top:16px;right:16px;z-index:3;display:inline-flex;align-items:center;gap:.35rem;
          padding:.22rem .6rem;border-radius:999px;background:rgba(7,3,15,.72);border:1px solid rgba(255,255,255,.14);
          font-family:'Oxanium',sans-serif;font-size:.66rem;font-weight:700;letter-spacing:.12em;color:#fff}
        .ovl-live i{width:6px;height:6px;border-radius:50%;background:var(--bad)}
        .ovl-stage-cap{display:flex;align-items:center;gap:.35rem;margin:.7rem 0 0;font-size:.8rem;color:var(--ink-3)}
        .ovl-stage-cap svg{color:var(--accent)}

        /* الحساب */
        .ovl-acc{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding:1.1rem}
        .ovl-acc-l{display:flex;align-items:center;gap:.85rem;min-width:0}
        .ovl-avatar{width:52px;height:52px;border-radius:50%;flex:none;display:grid;place-items:center;
          background:var(--panel-2);border:1px solid var(--line-2);
          font-family:'Oxanium',sans-serif;font-size:1.2rem;font-weight:800;color:var(--accent)}
        .ovl-acc b{display:block;color:var(--ink);font-size:.98rem;font-weight:700}
        .ovl-acc small{display:block;font-size:.8rem;color:var(--ink-3);direction:ltr;text-align:right}
        .ovl-sub{display:flex;align-items:center;gap:.5rem;font-size:.84rem;color:var(--ink-2)}
        .ovl-sub b{color:var(--ink);display:inline;font-size:.84rem}

        /* الخطط */
        .ovl-sec{margin:2.2rem 0 1.1rem}
        .ovl-sec h2{margin:0 0 .25rem;font-family:'29LtBukra','Cairo',sans-serif;font-size:1.25rem;font-weight:700;color:var(--ink)}
        .ovl-sec p{margin:0;font-size:.86rem;color:var(--ink-3)}
        .ovl-plans{display:grid;gap:1rem;grid-template-columns:repeat(3,minmax(0,1fr))}
        .ovl-plan{background:var(--panel);border:1px solid var(--line);border-radius:14px;
          padding:1.35rem 1.25rem 1.2rem;display:flex;flex-direction:column;transition:border-color .2s}
        .ovl-plan:hover{border-color:var(--line-2)}
        .ovl-plan.best{border-color:var(--line-2);background:var(--panel-2)}
        .ovl-plan-top{display:flex;justify-content:flex-start;margin-bottom:.9rem}
        .ovl-pill{font-size:.72rem;font-weight:700;padding:.22rem .65rem;border-radius:6px;
          background:var(--panel-2);border:1px solid var(--line);color:var(--ink-2)}
        .ovl-plan.best .ovl-pill{background:var(--grape);border-color:var(--grape);color:#fff}
        .ovl-plan h3{margin:0 0 .6rem;text-align:center;font-size:1rem;font-weight:700;color:var(--ink)}
        .ovl-price{display:flex;align-items:baseline;justify-content:center;gap:.35rem}
        .ovl-price b{font-family:'Oxanium',sans-serif;font-size:2.25rem;font-weight:800;color:var(--ink);
          line-height:1.1;font-variant-numeric:tabular-nums}
        .ovl-price span{font-size:.82rem;color:var(--ink-3)}
        .ovl-save-tag{align-self:center;margin:.55rem 0 1rem;font-size:.76rem;
          padding:.22rem .7rem;border-radius:6px;background:var(--well);border:1px solid var(--line);color:var(--ink-2)}
        .ovl-save-tag em{font-style:normal;color:var(--accent)}
        .ovl-plan ul{list-style:none;margin:0 0 1.2rem;padding:1rem 0 0;border-top:1px solid var(--line);
          display:grid;gap:.55rem;flex:1}
        .ovl-plan li{display:flex;gap:.5rem;align-items:center;font-size:.84rem;color:var(--ink-2)}
        .ovl-plan li svg{flex:none;color:var(--accent)}
        .ovl-plan .ovl-btn{width:100%}
        .ovl-trust{display:flex;justify-content:center;gap:1.4rem;flex-wrap:wrap;
          margin-top:1.1rem;font-size:.8rem;color:var(--ink-3)}
        .ovl-trust span{display:inline-flex;align-items:center;gap:.35rem}
        .ovl-trust svg{color:var(--accent)}

        /* المميزات */
        .ovl-feats{display:grid;gap:1rem;grid-template-columns:repeat(4,minmax(0,1fr))}
        .ovl-feat{text-align:center;padding:1.3rem 1rem;background:var(--panel);border:1px solid var(--line);border-radius:14px}
        .ovl-hex{width:54px;height:60px;margin:0 auto .8rem;position:relative;display:grid;place-items:center;color:var(--accent)}
        .ovl-hex::before{content:'';position:absolute;inset:0;background:var(--line-2);
          clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)}
        .ovl-hex::after{content:'';position:absolute;inset:1.5px;background:var(--panel);
          clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)}
        .ovl-hex svg{position:relative;z-index:1}
        .ovl-feat b{display:block;color:var(--ink);font-size:.92rem;margin-bottom:.35rem}
        .ovl-feat p{margin:0;font-size:.8rem;line-height:1.7;color:var(--ink-3)}

        /* الجاهزية */
        .ovl-ready{display:flex;align-items:center;gap:1.3rem;flex-wrap:wrap;
          padding:.85rem 1.1rem;margin-bottom:1.3rem}
        .ovl-ready-t{display:flex;align-items:center;gap:.45rem;font-size:.85rem;color:var(--ink)}
        .ovl-ready-t svg{color:var(--accent)}
        .ovl-ready-t b{font-family:'Oxanium',sans-serif;color:var(--accent)}
        .ovl-ready ul{list-style:none;margin:0;padding:0;display:flex;gap:1.1rem;flex-wrap:wrap}
        .ovl-ready li{display:flex;align-items:center;gap:.4rem;font-size:.82rem;color:var(--ink-3)}
        .ovl-ready li.on{color:var(--ink-2)}
        .ovl-ready li i{width:15px;height:15px;border-radius:50%;border:1px solid var(--line-2);flex:none;
          display:grid;place-items:center;font-style:normal;font-size:9px;color:transparent}
        .ovl-ready li.on i{background:var(--ok);border-color:var(--ok);color:#08210f}

        /* التبويبات */
        .ovl-tabs{display:flex;gap:.45rem;flex-wrap:wrap;margin-bottom:1.2rem}
        .ovl-tab{display:inline-flex;align-items:center;gap:.4rem;cursor:pointer;height:36px;
          padding:0 .95rem;border-radius:9px;background:var(--panel);border:1px solid var(--line);
          color:var(--ink-2);font-size:.84rem;transition:background .2s,color .2s,border-color .2s}
        .ovl-tab:hover{background:var(--panel-2);color:var(--ink)}
        .ovl-tab[aria-pressed="true"]{background:rgba(127,58,161,.22);border-color:var(--line-2);color:var(--ink)}
        .ovl-tab b{font-family:'Oxanium',sans-serif;font-size:.72rem;color:var(--ink-3)}

        /* كروت التركيبات: عمودين */
        .ovl-grid{display:grid;gap:1.1rem;grid-template-columns:repeat(2,minmax(0,1fr))}
        .ovl-o{background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden;
          display:flex;flex-direction:column;transition:border-color .2s}
        .ovl-o:hover{border-color:var(--line-2)}
        .ovl-o-head{display:flex;align-items:center;justify-content:space-between;gap:.6rem;
          padding:.8rem 1rem;border-bottom:1px solid var(--line)}
        .ovl-o-head h3{margin:0;display:flex;align-items:center;gap:.5rem;font-size:.95rem;font-weight:700;color:var(--ink)}
        .ovl-o-head h3 svg{color:var(--accent)}
        .ovl-flags{display:flex;gap:.3rem}
        .ovl-flag{font-size:.68rem;font-weight:700;padding:.16rem .5rem;border-radius:5px;
          background:var(--well);border:1px solid var(--line);color:var(--ink-2)}
        .ovl-flag.free{color:#a7f3c8;border-color:rgba(74,222,128,.35)}
        /* صف التحكم فوق المعاينة: نفس الزرار في نفس المكان في كل كارت */
        .ovl-o-ctl{display:flex;gap:.45rem;align-items:center;padding:.7rem .8rem;border-bottom:1px solid var(--line)}
        .ovl-o-ctl input{flex:1;min-width:0;height:34px;padding:0 .6rem;border-radius:8px;
          background:var(--well);border:1px solid var(--line);color:var(--ink-3);
          font-family:'Oxanium',monospace;font-size:.72rem;direction:ltr;text-align:left}
        .ovl-o-ctl .ovl-btn{flex:none}
        .ovl-o-ctl .ovl-btn.full{flex:1}
        .ovl-prev{position:relative;aspect-ratio:16/9;background:#000}
        .ovl-prev iframe,.ovl-prev img{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}
        .ovl-prev img{object-fit:cover}
        .ovl-o-desc{margin:0;padding:.75rem 1rem .9rem;border-top:1px solid var(--line);
          font-size:.82rem;line-height:1.7;color:var(--ink-3)}

        /* الألوان */
        .ovl-theme{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:1.2rem;align-items:start}
        .ovl-theme .ovl-panel{padding:1.1rem}
        .ovl-chips{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem;margin-bottom:1.1rem}
        .ovl-chip{display:inline-flex;align-items:center;justify-content:center;gap:.45rem;cursor:pointer;height:40px;
          border-radius:9px;background:var(--panel-2);border:1px solid var(--line);color:var(--ink-2);
          font-size:.85rem;transition:background .2s,color .2s,border-color .2s}
        .ovl-chip:hover{color:var(--ink);border-color:var(--line-2)}
        .ovl-chip[aria-pressed="true"]{background:rgba(127,58,161,.22);border-color:var(--line-2);color:var(--ink)}
        .ovl-chip i{width:11px;height:11px;border-radius:3px;flex:none}
        .ovl-savebar{display:flex;align-items:center;gap:.8rem;flex-wrap:wrap}
        .ovl-ok{font-size:.82rem;color:var(--ok)}
        .ovl-screen{position:relative;aspect-ratio:16/9;background:#000}
        .ovl-screen iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}
        .ovl-empty-screen{position:absolute;inset:0;display:grid;place-items:center;font-size:.84rem;color:var(--ink-3)}

        /* الخطوات */
        .ovl-steps{counter-reset:s;display:grid;gap:.75rem;grid-template-columns:repeat(2,minmax(0,1fr))}
        .ovl-stp{counter-increment:s;display:grid;grid-template-columns:auto 1fr;gap:.85rem;align-items:start;padding:1.1rem}
        .ovl-stp::before{content:counter(s);font-family:'Oxanium',sans-serif;font-size:.85rem;font-weight:800;
          width:30px;height:30px;border-radius:8px;display:grid;place-items:center;
          background:var(--panel-2);border:1px solid var(--line-2);color:var(--accent)}
        .ovl-stp b{display:block;color:var(--ink);font-size:.92rem;margin-bottom:.3rem}
        .ovl-stp p{margin:0;font-size:.84rem;line-height:1.75;color:var(--ink-3)}
        .ovl-stp code{font-family:'Oxanium',monospace;font-size:.84em;direction:ltr;display:inline-block;
          background:var(--well);border:1px solid var(--line);color:var(--ink-2);padding:0 .35em;border-radius:4px}

        /* الأسئلة */
        .ovl-faq{display:grid;gap:.6rem;max-width:820px}
        .ovl-qa{background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden}
        .ovl-qa.open{border-color:var(--line-2)}
        .ovl-q{width:100%;text-align:right;cursor:pointer;background:none;border:0;padding:1rem 1.15rem;
          font-size:.92rem;font-weight:600;color:var(--ink);display:flex;justify-content:space-between;align-items:center;gap:1rem}
        .ovl-q i{color:var(--accent);font-style:normal;transition:transform .25s;flex:none;font-size:.75rem}
        .ovl-qa.open .ovl-q i{transform:rotate(180deg)}
        .ovl-a{padding:0 1.15rem 1.1rem;margin:0;font-size:.86rem;line-height:1.9;color:var(--ink-3)}

        .ovl-none{border:1px dashed var(--line-2);border-radius:14px;padding:2.6rem 1.4rem;text-align:center}
        .ovl-none b{display:block;color:var(--ink);font-size:1rem;margin-bottom:.45rem}
        .ovl-none p{margin:0 auto;max-width:44ch;font-size:.86rem;line-height:1.8;color:var(--ink-3)}
        .ovl-none .ovl-btn{margin-top:1.1rem}

        .ovl-foot{border-top:1px solid var(--line);padding:1.3rem 1.5rem;display:flex;
          justify-content:space-between;gap:1rem;flex-wrap:wrap;font-size:.78rem;color:var(--ink-3)}
        .ovl-foot nav{display:flex;gap:1.1rem;flex-wrap:wrap}
        .ovl-foot a{color:var(--ink-3);text-decoration:none}
        .ovl-foot a:hover{color:var(--ink-2)}

        /* نافذة الدفع */
        .ovl-modal-back{position:fixed;inset:0;z-index:80;background:rgba(6,2,14,.8);backdrop-filter:blur(6px);
          display:grid;place-items:center;padding:1rem;overflow-y:auto}
        .ovl-modal{width:min(100%,460px);background:var(--panel);border:1px solid var(--line-2);border-radius:16px;overflow:hidden}
        .ovl-modal-h{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.2rem;border-bottom:1px solid var(--line)}
        .ovl-modal-h h2{margin:0;font-size:1.02rem;font-weight:700;color:var(--ink)}
        .ovl-x{width:32px;height:32px;border-radius:8px;display:grid;place-items:center;cursor:pointer;
          background:var(--panel-2);border:1px solid var(--line);color:var(--ink-2)}
        .ovl-x:hover{color:var(--ink);border-color:var(--line-2)}
        .ovl-co-sum{display:flex;align-items:baseline;justify-content:space-between;padding:1rem 1.2rem;
          background:var(--well);border-bottom:1px solid var(--line)}
        .ovl-co-sum span{font-size:.84rem;color:var(--ink-3)}
        .ovl-co-sum b{font-family:'Oxanium',sans-serif;font-size:1.6rem;font-weight:800;color:var(--ink);font-variant-numeric:tabular-nums}
        .ovl-co-sum small{font-family:'Cairo',sans-serif;font-size:.8rem;font-weight:400;color:var(--ink-3)}
        .ovl-co-login{padding:1.2rem;text-align:center}
        .ovl-co-login p{margin:0 0 1rem;font-size:.87rem;line-height:1.8;color:var(--ink-2)}
        .ovl-co-field{display:block;padding:1.1rem 1.2rem .4rem}
        .ovl-co-field span{display:block;font-size:.8rem;color:var(--ink-2);margin-bottom:.4rem}
        .ovl-co-field input{width:100%;height:42px;padding:0 .8rem;border-radius:10px;background:var(--well);
          border:1px solid var(--line);color:var(--ink);font-family:'Oxanium',sans-serif;font-size:.95rem;direction:ltr;text-align:left;outline:0}
        .ovl-co-field input:focus{border-color:var(--line-2)}
        .ovl-co-err{margin:.5rem 1.2rem 0;padding:.55rem .8rem;border-radius:9px;font-size:.82rem;
          background:rgba(240,98,119,.1);border:1px solid rgba(240,98,119,.4);color:#ffd4db}
        .ovl-co-methods{display:grid;gap:.6rem;padding:.9rem 1.2rem}
        .ovl-co-m{display:flex;align-items:center;gap:.8rem;width:100%;text-align:right;cursor:pointer;
          padding:.85rem .95rem;border-radius:12px;background:var(--panel-2);border:1px solid var(--line);color:var(--ink);
          transition:border-color .2s,background .2s}
        .ovl-co-m:hover:not(:disabled){border-color:var(--line-2);background:rgba(127,58,161,.16)}
        .ovl-co-m:disabled{opacity:.6;cursor:wait}
        .ovl-co-m svg{flex:none;color:var(--accent)}
        .ovl-co-m b{display:block;font-size:.92rem}
        .ovl-co-m small{display:block;font-size:.76rem;color:var(--ink-3);margin-top:.1rem}
        .ovl-pp{flex:none;width:20px;height:20px;border-radius:5px;display:grid;place-items:center;
          font-family:'Oxanium',sans-serif;font-weight:800;font-size:.8rem;background:var(--grape);color:#fff}
        .ovl-co-m:focus-visible,.ovl-x:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
        .ovl-co-note{display:flex;align-items:center;justify-content:center;gap:.35rem;margin:0;
          padding:.2rem 1.2rem 1.1rem;font-size:.78rem;color:var(--ink-3)}
        .ovl-co-note svg{color:var(--accent)}
        .ovl-paid{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:70;
          display:flex;align-items:center;gap:.6rem;max-width:calc(100% - 2rem);
          background:var(--panel-2);border:1px solid rgba(74,222,128,.45);color:var(--ink);
          padding:.65rem .8rem .65rem 1rem;border-radius:12px;font-size:.86rem}
        .ovl-paid > svg{color:var(--ok);flex:none}
        .ovl-paid button{background:none;border:0;color:var(--ink-3);cursor:pointer;display:grid;place-items:center}

        .ovl-scrim{display:none}
        @media(max-width:1100px){
          .ovl-feats{grid-template-columns:repeat(2,minmax(0,1fr))}
        }
        @media(max-width:900px){
          .ovl-side{transform:translateX(100%);transition:transform .25s}
          .ovl-side.open{transform:none}
          .ovl-main{margin-right:0}
          .ovl-burger{display:grid}
          .ovl-scrim.on{display:block;position:fixed;inset:0;z-index:35;background:rgba(6,2,14,.7)}
          .ovl-body{padding:1.3rem 1rem 2.5rem}
          .ovl-plans,.ovl-grid,.ovl-theme,.ovl-steps,.ovl-stage-wrap{grid-template-columns:1fr}
          .ovl-who small{display:none}
          .ovl-bar{padding:0 1rem}
        }
        @media(max-width:560px){
          .ovl-feats{grid-template-columns:1fr}
          .ovl-field input{width:96px}
          .ovl-state{display:none}
        }
        @media(prefers-reduced-motion:reduce){.ovl *{transition:none!important;animation:none!important}}
      `}</style>

      {/* ── الشريط الجانبي ──────────────────────────────── */}
      <aside className={`ovl-side${menu ? ' open' : ''}`}>
        <div className="ovl-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.webp" alt="Tilago" width={39} height={26} />
          <b>TILAGO</b>
        </div>
        <nav className="ovl-nav" aria-label="أقسام اللوحة">
          {NAV.map(n => (
            <button key={n.key} type="button" aria-current={section === n.key} onClick={() => go(n.key)}>
              <n.Icon size={20} />
              {n.name}
              {n.key === 'overlays' && overlays.length > 0 && <span className="ovl-badge">{overlays.length}</span>}
              {n.soon && <span className="ovl-soon">قريباً</span>}
            </button>
          ))}
        </nav>
        <div className="ovl-side-foot">
          <Link href="/">المتجر</Link>
          <Link href="/contact">الدعم</Link>
        </div>
      </aside>

      <div className={`ovl-scrim${menu ? ' on' : ''}`} onClick={() => setMenu(false)} />

      <div className="ovl-main">
        {/* ── الشريط العلوي ─────────────────────────────── */}
        <header className="ovl-bar">
          <div className="ovl-conn">
            <label className="ovl-field">
              <span>@</span>
              <input value={handle} onChange={e => setHandle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveHandle(); }}
                placeholder="يوزر تيك توك" aria-label="يوزر تيك توك" spellCheck={false} />
            </label>
            <button type="button" className="ovl-btn ghost" onClick={saveHandle}>اتصال</button>
            <span className="ovl-state"><i className="ovl-dot" />غير متصل</span>
          </div>

          <div className="ovl-who">
            {email
              ? <small>{email}</small>
              : <Link className="ovl-btn sm" href="/auth/signin?callbackUrl=/overlay"><LogIn size={14} /> دخول</Link>}
            <button type="button" className="ovl-burger" onClick={() => setMenu(m => !m)} aria-label="القائمة">
              {menu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
          {handleNote && <div className="ovl-note" role="status">{handleNote}</div>}
        </header>

        <main className="ovl-body">
          {/* ── الرئيسية: الحساب + الخطط + المميزات ─────── */}
          {section === 'home' && (
            <>
              <section className="ovl-stage-wrap">
                <div>
                  <div className="ovl-stage">
                    <span className="ovl-live"><i />LIVE</span>
                    <div className="ovl-screen">
                      {demo
                        ? <iframe src={previewSrc(demo.file, active.vars)} title={`معاينة ${demo.title}`} />
                        : <span className="ovl-empty-screen">المعاينة هتبان أول ما تنزل تركيبة</span>}
                    </div>
                  </div>
                  <p className="ovl-stage-cap"><Sparkles size={14} /> دي التركيبة نفسها وهي شغّالة، مش صورة</p>
                </div>
                <div>
                  <h1 className="ovl-hero-h">شاشتك <em>بترد</em> على جمهورك وانت لايف</h1>
                  <p className="ovl-hero-p">
                    تركيبات بث لتيك توك بتصميم عربي حصري. رابط واحد تحطه في OBS، بألوانك،
                    والمكتبة بتكبر من غير ما تدفع زيادة.
                  </p>
                  <button type="button" className="ovl-btn" onClick={() => go('overlays')}>
                    <Layers size={16} /> شوف المكتبة
                  </button>
                </div>
              </section>

              <div className="ovl-panel">
                <div className="ovl-panel-h"><h2>الحساب</h2></div>
                <div className="ovl-acc">
                  {email ? (
                    <>
                      <div className="ovl-acc-l">
                        <span className="ovl-avatar">{initial}</span>
                        <div>
                          <b>{name || 'مستخدم Tilago'}</b>
                          <small>{email}</small>
                        </div>
                      </div>
                      <div className="ovl-sub">
                        <i className={`ovl-dot${live ? ' on' : ''}`} />
                        {!sub ? 'مفيش اشتراك'
                          : live ? <span>اشتراك <b>{PLAN_NAME[sub.plan] ?? sub.plan}</b> · فاضل {left} يوم{sub.endsAt ? ` · بيخلص ${fmtDate(sub.endsAt)}` : ''}</span>
                          : 'الاشتراك متوقف'}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="ovl-acc-l">
                        <span className="ovl-avatar">T</span>
                        <div>
                          <b>سجّل دخولك</b>
                          <small style={{ direction: 'rtl' }}>بجوجل، في ثانية</small>
                        </div>
                      </div>
                      <Link className="ovl-btn" href="/auth/signin?callbackUrl=/overlay"><LogIn size={16} /> تسجيل الدخول بجوجل</Link>
                    </>
                  )}
                </div>
              </div>

              <div className="ovl-sec">
                <h2>اختار خطتك</h2>
                <p>اشتراك واحد فيه المكتبة كلها، من غير باقات ولا مميزات مقفولة.</p>
              </div>

              <div className="ovl-plans">
                {PLANS.map(p => {
                  const best = 'best' in p && p.best;
                  return (
                    <div key={p.key} className={`ovl-plan${best ? ' best' : ''}`}>
                      <div className="ovl-plan-top"><span className="ovl-pill">{best ? 'الأوفر' : p.name}</span></div>
                      <h3>اشتراك {p.name}</h3>
                      <div className="ovl-price">
                        <b>{p.price.toLocaleString('en-US')}</b>
                        <span>جنيه / {p.unit}</span>
                      </div>
                      <span className="ovl-save-tag">الشهر بـ <em>{p.per} جنيه</em> · {p.note}</span>
                      <ul>{PERKS.map(x => <li key={x}><Check size={14} />{x}</li>)}</ul>
                      <button type="button" className={`ovl-btn${best ? '' : ' ghost'}`} onClick={() => openCheckout(p)}>
                        {sub ? 'جدّد الآن' : 'اشترك الآن'}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="ovl-trust">
                <span><ShieldCheck size={14} /> استرجاع كامل خلال 7 أيام لو مركّبتش</span>
                <span><Zap size={14} /> فيزا · ميزا · بايبال</span>
              </div>

              <div className="ovl-sec">
                <h2>ليه Tilago Overlay؟</h2>
                <p>الحاجات اللي بتفرق فعلاً وانت لايف.</p>
              </div>
              <div className="ovl-feats">
                {FEATURES.map(f => (
                  <div className="ovl-feat" key={f.t}>
                    <span className="ovl-hex"><f.Icon size={20} /></span>
                    <b>{f.t}</b>
                    <p>{f.d}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── التركيبات ─────────────────────────────── */}
          {section === 'overlays' && (
            <>
              <h1 className="ovl-h">التركيبات</h1>
              <p className="ovl-p">
                كل تركيبة ليها رابط خاص بيك. انسخه وحطه في OBS كـ Browser Source، ودوس «جرّب» قبل البث.
              </p>

              <div className="ovl-panel ovl-ready">
                <span className="ovl-ready-t"><Sparkles size={16} /> جاهزيتك <b>{doneCount}/{steps.length}</b></span>
                <ul>
                  {steps.map(s => (
                    <li key={s.label} className={s.done ? 'on' : ''}><i>{s.done ? '✓' : ''}</i>{s.label}</li>
                  ))}
                </ul>
              </div>

              {overlays.length > 0 && (
                <div className="ovl-tabs" role="group" aria-label="تصنيفات">
                  <button type="button" className="ovl-tab" aria-pressed={cat === 'ALL'} onClick={() => setCat('ALL')}>
                    الكل <b>{counts.ALL}</b>
                  </button>
                  {CATS.filter(c => counts[c.key]).map(c => (
                    <button key={c.key} type="button" className="ovl-tab" aria-pressed={cat === c.key} onClick={() => setCat(c.key)}>
                      <c.Icon size={13} /> {c.name} <b>{counts[c.key]}</b>
                    </button>
                  ))}
                </div>
              )}

              {overlays.length === 0 ? (
                <div className="ovl-none">
                  <b>أول التركيبات في الطريق</b>
                  <p>بنجهّز المكتبة دلوقتي. أول ما تنزل تركيبة هتلاقيها هنا برابطها جاهز.</p>
                </div>
              ) : (
                <div className="ovl-grid">
                  {shown.map(o => {
                    const catInfo = CATS.find(c => c.key === o.category);
                    const url = linkFor(o);
                    const usable = (live || o.isFree) && Boolean(url);
                    return (
                      <article className="ovl-o" key={o.id}>
                        <div className="ovl-o-head">
                          <h3>{catInfo && <catInfo.Icon size={16} />}{o.title}</h3>
                          <div className="ovl-flags">
                            {isNew(o.createdAt) && <span className="ovl-flag">جديد</span>}
                            {o.isFree && <span className="ovl-flag free">مجانية</span>}
                          </div>
                        </div>

                        <div className="ovl-o-ctl">
                          {usable ? (
                            <>
                              <button type="button" className={`ovl-btn sm${copied === o.id ? ' done' : ''}`} onClick={() => copy(url, o.id)}>
                                {copied === o.id ? <Check size={13} /> : <Copy size={13} />}
                                {copied === o.id ? 'اتنسخ' : 'نسخ'}
                              </button>
                              <input readOnly value={url} onFocus={e => e.currentTarget.select()} aria-label={`رابط ${o.title}`} />
                              <button type="button" className={`ovl-btn sm ghost${tested === o.id ? ' done' : ''}`} onClick={() => test(o)}>
                                <Play size={13} /> {tested === o.id ? 'ردّت' : 'جرّب'}
                              </button>
                            </>
                          ) : (
                            <button type="button" className="ovl-btn sm full" onClick={() => go('home')}>
                              <Zap size={13} /> {email ? 'اشترك عشان تاخد الرابط' : 'سجّل دخول واشترك عشان تاخد الرابط'}
                            </button>
                          )}
                        </div>

                        <div className="ovl-prev">
                          {o.poster
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={o.poster} alt="" loading="lazy" />
                            : <iframe ref={el => { cardFrames.current[o.id] = el; }}
                                src={previewSrc(o.file, active.vars)} title={o.title} loading="lazy" />}
                        </div>

                        {o.description && <p className="ovl-o-desc">{o.description}</p>}
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── الألوان ───────────────────────────────── */}
          {section === 'theme' && (
            <>
              <h1 className="ovl-h">الألوان</h1>
              <p className="ovl-p">
                اختار اللون واحفظه. الرابط اللي في OBS مابيتغيّرش، والتركيبة بتتحدّث على بثك في نفس اللحظة.
              </p>
              <div className="ovl-theme">
                <div className="ovl-panel">
                  <div className="ovl-chips" role="group" aria-label="لون التركيبات">
                    {PALETTES.map(p => (
                      <button key={p.key} type="button" className="ovl-chip" aria-pressed={palette === p.key} onClick={() => setPalette(p.key)}>
                        <i style={{ background: p.dot }} aria-hidden="true" />{p.name}
                      </button>
                    ))}
                  </div>
                  {sub ? (
                    <div className="ovl-savebar">
                      <button type="button" className="ovl-btn" onClick={saveTheme} disabled={saving}>
                        {saving ? 'بيحفظ…' : 'احفظ اللون'}
                      </button>
                      {saved && <span className="ovl-ok">اتحفظ، والتركيبات اتحدّثت</span>}
                    </div>
                  ) : (
                    <button type="button" className="ovl-btn ghost" onClick={() => go('home')}>
                      <Zap size={14} /> الحفظ بييجي مع الاشتراك
                    </button>
                  )}
                </div>

                <div className="ovl-panel" style={{ overflow: 'hidden' }}>
                  <div className="ovl-panel-h"><h2>المعاينة</h2><span className="ovl-flag">{active.name}</span></div>
                  <div className="ovl-screen">
                    {demo
                      ? <iframe ref={themeFrame} key={active.key}
                          src={previewSrc(demo.file, active.vars)}
                          title="معاينة ألوانك" loading="lazy" />
                      : <span className="ovl-empty-screen">المعاينة هتبان أول ما تنزل تركيبة</span>}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── التركيب ───────────────────────────────── */}
          {section === 'install' && (
            <>
              <h1 className="ovl-h">التركيب في OBS</h1>
              <p className="ovl-p">مفيش تنصيب ولا تحذير من ويندوز. العملية بتاخد أقل من دقيقة.</p>
              <div className="ovl-steps">
                <div className="ovl-panel ovl-stp"><div><b>انسخ الرابط</b>
                  <p>من قسم التركيبات، كل واحدة ليها رابط خاص بيك وبألوانك. ضغطة واحدة وهو في الحافظة.</p></div></div>
                <div className="ovl-panel ovl-stp"><div><b>ضيف Browser Source</b>
                  <p>في OBS اختار <code>Sources</code> ثم <code>+</code> ثم <code>Browser</code>، والزق الرابط في <code>URL</code>.</p></div></div>
                <div className="ovl-panel ovl-stp"><div><b>حط المقاس</b>
                  <p><code>Width 1920</code> و <code>Height 1080</code> ثم <code>OK</code>. التركيبة بتظبط نفسها على أي مقاس.</p></div></div>
                <div className="ovl-panel ovl-stp"><div><b>جرّبها قبل البث</b>
                  <p>ارجع لقسم التركيبات ودوس «جرّب». لو التركيبة ردّت على الشاشة، انت جاهز.</p></div></div>
              </div>
            </>
          )}

          {/* ── أقسام لسه بتتجهّز ─────────────────────── */}
          {SOON[section] && (
            <>
              <h1 className="ovl-h">{SOON[section].title}</h1>
              <p className="ovl-p">{SOON[section].lead}</p>
              <div className="ovl-soon-box">
                <div className="ovl-panel">
                  <span className="ovl-soon-tag"><Hourglass size={13} /> بيتجهّز</span>
                  <ul>
                    {SOON[section].points.map(p => (
                      <li key={p}><Check size={15} />{p}</li>
                    ))}
                  </ul>
                  <p className="ovl-soon-note">
                    القسم ده محتاج ربط ببثك على تيك توك عشان يقرا الأحداث الحيّة، وده اللي بنشتغل
                    عليه دلوقتي. لحد ما يجهز، تركيبات التزيين شغّالة عادي من غير أي ربط.
                  </p>
                  <button type="button" className="ovl-btn ghost" style={{ marginTop: '1.2rem' }} onClick={() => go('overlays')}>
                    <Layers size={15} /> شوف التركيبات الجاهزة
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── مساعدة ────────────────────────────────── */}
          {section === 'help' && (
            <>
              <h1 className="ovl-h">مساعدة</h1>
              <p className="ovl-p">لو سؤالك مش هنا، ابعتلنا وهنرد عليك.</p>
              <div className="ovl-faq">
                {FAQ.map((f, i) => (
                  <div className={`ovl-qa${openFaq === i ? ' open' : ''}`} key={f.q}>
                    <button type="button" className="ovl-q" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      {f.q}<i>▾</i>
                    </button>
                    {openFaq === i && <p className="ovl-a">{f.a}</p>}
                  </div>
                ))}
              </div>
            </>
          )}
        </main>

        <PaidBanner live={live} />
        {checkout && <CheckoutModal plan={checkout} email={email} onClose={() => setCheckout(null)} />}

        <footer className="ovl-foot">
          <span>Tilago Overlay · مصمّمة لصنّاع البث على تيك توك</span>
          <nav>
            <button type="button" onClick={() => go('help')} style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit' }}>الأسئلة الشائعة</button>
            <Link href="/contact">تواصل معنا</Link>
            <Link href="/">المتجر</Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}

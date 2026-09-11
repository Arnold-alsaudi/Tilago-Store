'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Layers, Palette, MonitorPlay, CreditCard, HelpCircle, User,
  Copy, Check, Play, Gift, Trophy, Target, Frame, Menu, X,
  Sparkles, Clock, ShieldCheck, Zap,
} from 'lucide-react';

export type OverlayCategory = 'SUPPORTERS' | 'CHALLENGES' | 'GOALS' | 'DECOR';

export interface AppOverlay {
  id: string; slug: string; title: string; description: string | null;
  category: OverlayCategory; file: string; poster: string | null;
  isFree: boolean; featured: boolean; createdAt: string;
}

export type AppSub = {
  plan: string; status: string; endsAt: string | null;
  token: string; theme: Record<string, string> | null;
} | null;

/* ── ثوابت ──────────────────────────────────────────────────── */

const PALETTES = [
  { key: 'violet', name: 'بنفسجي', dot: '#a855f7', vars: { violet: '#a855f7', 'violet-hot': '#e9d5ff' } },
  { key: 'fire',   name: 'ناري',   dot: '#f43f5e', vars: { violet: '#f43f5e', 'violet-hot': '#ffd7dd' } },
  { key: 'gold',   name: 'ذهبي',   dot: '#e9b84a', vars: { violet: '#e9b84a', 'violet-hot': '#fff0c4' } },
  { key: 'ice',    name: 'جليدي',  dot: '#38bdf8', vars: { violet: '#38bdf8', 'violet-hot': '#d8f2ff' } },
  { key: 'toxic',  name: 'سام',    dot: '#4ade80', vars: { violet: '#4ade80', 'violet-hot': '#dcffe8' } },
  { key: 'rose',   name: 'وردي',   dot: '#fb7185', vars: { violet: '#fb7185', 'violet-hot': '#ffe0e6' } },
] as const;

const CATS: { key: OverlayCategory; name: string; Icon: typeof Gift }[] = [
  { key: 'SUPPORTERS', name: 'داعمين', Icon: Gift },
  { key: 'CHALLENGES', name: 'تحديات', Icon: Trophy },
  { key: 'GOALS',      name: 'أهداف',  Icon: Target },
  { key: 'DECOR',      name: 'تزيين',  Icon: Frame },
];

const PLANS = [
  { key: 'm3', name: '3 شهور', price: 749,  per: 250, note: 'وفّر 16%' },
  { key: 'y',  name: 'سنوي',   price: 2399, per: 200, note: 'ادفع 8 شهور وخد سنة', best: true },
  { key: 'm1', name: 'شهري',   price: 299,  per: 299, note: 'من غير التزام' },
] as const;

const PLAN_NAME: Record<string, string> = { m1: 'شهري', m3: '3 شهور', y: 'سنوي' };

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

const isNew = (iso: string) => Date.now() - new Date(iso).getTime() < 14 * 86400000;

type SectionKey = 'overlays' | 'theme' | 'install' | 'plans' | 'help' | 'account';

const NAV: { key: SectionKey; name: string; Icon: typeof Layers }[] = [
  { key: 'overlays', name: 'التركيبات', Icon: Layers },
  { key: 'theme',    name: 'الألوان',   Icon: Palette },
  { key: 'install',  name: 'التركيب',   Icon: MonitorPlay },
  { key: 'plans',    name: 'الاشتراك',  Icon: CreditCard },
  { key: 'help',     name: 'مساعدة',    Icon: HelpCircle },
  { key: 'account',  name: 'حسابك',     Icon: User },
];

/* ============================================================ */

export default function OverlayApp({
  name, email, sub, overlays,
}: {
  name: string | null; email: string | null; sub: AppSub; overlays: AppOverlay[];
}) {
  const left = daysLeft(sub?.endsAt ?? null);
  const live = sub?.status === 'active' && (left === null || left > 0);

  const [section, setSection] = useState<SectionKey>(live ? 'overlays' : 'plans');
  const [menu, setMenu] = useState(false);
  const [cat, setCat] = useState<OverlayCategory | 'ALL'>('ALL');
  const [copied, setCopied] = useState<string | null>(null);
  const [tested, setTested] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const initialPalette = useMemo(() => {
    const v = sub?.theme?.violet;
    return PALETTES.find(p => p.vars.violet === v)?.key ?? 'violet';
  }, [sub]);
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

  /* اللون بيتبعت للمعاينة وهي شغّالة — من غير إعادة تحميل */
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

  /* زرار التجربة: بيبعت حدث وهمي للمعاينة، فالعميل يشوف التركيبة
     بترد بعينه قبل ما يفتح OBS أصلاً. ده بيرد على السؤال اللي بيخلي
     الناس تطلب استرجاع: "هي شغّالة ولا لأ؟" */
  function test(o: AppOverlay) {
    const f = cardFrames.current[o.id];
    f?.contentWindow?.postMessage({
      type: 'plate',
      data: { key: 't' + Date.now(), label: 'تجربة', name: name || 'أهلاً بيك', value: 1250 },
    }, '*');
    setTested(o.id); setTimeout(() => setTested(null), 2200);
  }

  /* خطوات جاهزية العميل — أكتر حتة بيتوهوا فيها هي OBS، فبدل ما
     نسيبه يكتشف لوحده، بنوريه هو فين وفاضله إيه. */
  const steps = [
    { done: Boolean(sub),              label: 'فعّلت اشتراكك' },
    { done: Boolean(sub?.theme),       label: 'اخترت ألوانك' },
    { done: overlays.length > 0,       label: 'في تركيبات جاهزة' },
  ];
  const doneCount = steps.filter(s => s.done).length;

  return (
    <div className="ovl" dir="rtl">
      <style>{`
        /* ألوان الموقع الأربعة. حدود وتعبئة بدل التوهّج — مفيش box-shadow
           ملوّن في الملف ده خالص. */
        .ovl{
          --deep:#0C0516; --navy:#0F083B; --grape:#5416B5; --violet:#7F3AA1;
          --ink:#ece8f7; --ink-2:#a49dc2; --ink-3:#7b7399;
          --accent:#9B59D0;
          --line:rgba(127,58,161,.22); --line-2:rgba(127,58,161,.42);
          --panel:#120A26; --panel-2:#170E2F;
          --ok:#4ade80; --warn:#fbbf24; --bad:#fb7185;
          --side:212px;
          min-height:100vh;background:var(--deep);color:var(--ink-2);
          font-family:'Cairo','29LtBukra','Montserrat',sans-serif;
          font-size:15px;
        }
        .ovl *{box-sizing:border-box}
        .ovl button{font-family:inherit}

        /* ── الشريط الجانبي ───────────────────────────────── */
        .ovl-side{
          position:fixed;inset:0 0 0 auto;width:var(--side);z-index:40;
          background:var(--panel);border-left:1px solid var(--line);
          display:flex;flex-direction:column;
        }
        .ovl-brand{
          display:flex;flex-direction:column;align-items:center;gap:.5rem;
          padding:1.5rem 1rem 1.2rem;border-bottom:1px solid var(--line);
        }
        .ovl-brand img{height:42px;width:auto;object-fit:contain}
        .ovl-brand b{
          font-family:'Oxanium',sans-serif;font-size:.82rem;font-weight:700;
          letter-spacing:.14em;color:var(--ink);
        }
        .ovl-nav{flex:1;overflow-y:auto;padding:.8rem .7rem;display:flex;flex-direction:column;gap:.25rem}
        .ovl-nav button{
          display:flex;align-items:center;gap:.7rem;width:100%;cursor:pointer;
          padding:.7rem .85rem;border-radius:10px;border:1px solid transparent;
          background:none;color:var(--ink-2);font-size:.9rem;text-align:right;
          transition:background .2s,color .2s,border-color .2s;
        }
        .ovl-nav button:hover{background:rgba(127,58,161,.14);color:var(--ink)}
        .ovl-nav button[aria-current="true"]{
          background:rgba(127,58,161,.22);border-color:var(--line-2);color:var(--ink);
        }
        .ovl-nav button svg{flex:none;color:var(--accent)}
        .ovl-nav .ovl-badge{
          margin-inline-start:auto;font-family:'Oxanium',sans-serif;font-size:.7rem;
          background:rgba(0,0,0,.35);padding:.1rem .42rem;border-radius:50px;color:var(--ink-3);
        }
        .ovl-side-foot{padding:.9rem 1rem;border-top:1px solid var(--line);font-size:.76rem;color:var(--ink-3)}
        .ovl-side-foot a{color:var(--ink-3);text-decoration:none;display:block;padding:.2rem 0}
        .ovl-side-foot a:hover{color:var(--ink-2)}

        /* ── المنطقة الرئيسية ─────────────────────────────── */
        .ovl-main{margin-inline-end:var(--side);min-height:100vh;display:flex;flex-direction:column}
        .ovl-bar{
          position:sticky;top:0;z-index:30;
          display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;
          padding:.85rem 1.6rem;background:rgba(12,5,22,.92);backdrop-filter:blur(10px);
          border-bottom:1px solid var(--line);
        }
        .ovl-status{display:flex;align-items:center;gap:.6rem;font-size:.85rem}
        .ovl-dot{width:8px;height:8px;border-radius:50%;flex:none;background:var(--ink-3)}
        .ovl-dot.on{background:var(--ok)}
        .ovl-dot.soon{background:var(--warn)}
        .ovl-dot.off{background:var(--bad)}
        .ovl-status b{color:var(--ink);font-weight:600}
        .ovl-who{display:flex;align-items:center;gap:.6rem;font-size:.84rem;color:var(--ink-3)}
        .ovl-who span{direction:ltr}

        .ovl-burger{
          display:none;background:none;border:1px solid var(--line);color:var(--ink-2);
          width:38px;height:38px;border-radius:10px;cursor:pointer;place-items:center;
        }

        .ovl-body{flex:1;padding:1.8rem 1.6rem 4rem;width:100%;max-width:1180px}
        .ovl-h{margin:0 0 .35rem;font-family:'Oxanium','29LtBukra',sans-serif;
          font-size:1.3rem;font-weight:700;color:var(--ink);line-height:1.5}
        .ovl-p{margin:0 0 1.7rem;font-size:.9rem;line-height:1.85;color:var(--ink-2);max-width:62ch}

        /* ── أزرار ────────────────────────────────────────── */
        .ovl-btn{
          display:inline-flex;align-items:center;gap:.5rem;cursor:pointer;
          font-size:.88rem;font-weight:600;padding:.62rem 1.3rem;border-radius:10px;
          border:1px solid transparent;background:var(--grape);color:#fff;
          transition:background .2s,border-color .2s,color .2s;text-decoration:none;
        }
        .ovl-btn:hover{background:var(--violet)}
        .ovl-btn:disabled{opacity:.5;cursor:not-allowed}
        .ovl-btn.ghost{background:rgba(127,58,161,.14);border-color:var(--line);color:var(--ink)}
        .ovl-btn.ghost:hover{background:rgba(127,58,161,.28);border-color:var(--line-2)}
        .ovl-btn.sm{padding:.45rem .85rem;font-size:.8rem;border-radius:8px}
        .ovl-btn.done{background:rgba(74,222,128,.16);border-color:rgba(74,222,128,.4);color:var(--ok)}
        .ovl-btn:focus-visible,.ovl-chip:focus-visible,.ovl-tab:focus-visible,
        .ovl-nav button:focus-visible,.ovl-q:focus-visible,.ovl-link input:focus-visible{
          outline:2px solid var(--accent);outline-offset:2px;
        }

        /* ── بطاقات ───────────────────────────────────────── */
        .ovl-card{background:var(--panel);border:1px solid var(--line);border-radius:12px}

        /* شريط الجاهزية */
        .ovl-ready{
          display:flex;align-items:center;gap:1.4rem;flex-wrap:wrap;
          padding:1rem 1.3rem;margin-bottom:1.8rem;
          background:var(--panel);border:1px solid var(--line);border-radius:12px;
        }
        .ovl-ready-t{display:flex;align-items:center;gap:.5rem;font-size:.86rem;color:var(--ink)}
        .ovl-ready-t b{font-family:'Oxanium',sans-serif;color:var(--accent)}
        .ovl-ready ul{list-style:none;margin:0;padding:0;display:flex;gap:1.1rem;flex-wrap:wrap}
        .ovl-ready li{display:flex;align-items:center;gap:.4rem;font-size:.83rem;color:var(--ink-3)}
        .ovl-ready li.on{color:var(--ink-2)}
        .ovl-ready li i{
          width:15px;height:15px;border-radius:50%;border:1px solid var(--line-2);flex:none;
          display:grid;place-items:center;font-style:normal;font-size:9px;color:transparent;
        }
        .ovl-ready li.on i{background:var(--ok);border-color:var(--ok);color:#08210f}

        /* تبويبات */
        .ovl-tabs{display:flex;gap:.45rem;flex-wrap:wrap;margin-bottom:1.4rem}
        .ovl-tab{
          display:inline-flex;align-items:center;gap:.4rem;cursor:pointer;font-size:.85rem;
          padding:.45rem 1rem;border-radius:8px;background:rgba(127,58,161,.1);
          border:1px solid var(--line);color:var(--ink-2);transition:background .2s,color .2s,border-color .2s;
        }
        .ovl-tab:hover{background:rgba(127,58,161,.24);color:var(--ink)}
        .ovl-tab[aria-pressed="true"]{background:rgba(127,58,161,.3);border-color:var(--line-2);color:var(--ink)}
        .ovl-tab b{font-family:'Oxanium',sans-serif;font-size:.72rem;color:var(--ink-3)}

        /* شبكة التركيبات */
        .ovl-grid{display:grid;gap:1.1rem;grid-template-columns:repeat(auto-fill,minmax(min(100%,330px),1fr))}
        .ovl-o{background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden;
          display:flex;flex-direction:column;transition:border-color .2s}
        .ovl-o:hover{border-color:var(--line-2)}
        .ovl-o-head{display:flex;align-items:center;justify-content:space-between;gap:.6rem;
          padding:.75rem .95rem;border-bottom:1px solid var(--line)}
        .ovl-o-head h3{margin:0;font-size:.92rem;font-weight:600;color:var(--ink)}
        .ovl-o-cat{display:inline-flex;align-items:center;gap:.3rem;font-size:.74rem;color:var(--ink-3)}
        .ovl-prev{position:relative;aspect-ratio:16/9;background:var(--panel-2);border-bottom:1px solid var(--line)}
        .ovl-prev iframe,.ovl-prev img{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}
        .ovl-prev img{object-fit:cover}
        .ovl-flags{position:absolute;top:8px;right:8px;z-index:2;display:flex;gap:.3rem}
        .ovl-flag{font-family:'Oxanium',sans-serif;font-size:.62rem;font-weight:700;letter-spacing:.08em;
          text-transform:uppercase;padding:.18rem .5rem;border-radius:5px;
          background:rgba(12,5,22,.8);border:1px solid var(--line-2);color:var(--ink-2)}
        .ovl-flag.new{color:#d9c6ff}
        .ovl-flag.free{color:#a7f3c8;border-color:rgba(74,222,128,.4)}
        .ovl-o-body{padding:.85rem .95rem 1rem;display:flex;flex-direction:column;gap:.7rem;flex:1}
        .ovl-o-body p{margin:0;font-size:.83rem;line-height:1.7;color:var(--ink-3)}
        .ovl-link{display:flex;gap:.4rem;align-items:center;margin-top:auto}
        .ovl-link input{flex:1;min-width:0;padding:.45rem .6rem;border-radius:8px;
          background:var(--deep);border:1px solid var(--line);color:var(--ink-3);
          font-family:'Oxanium',monospace;font-size:.74rem;direction:ltr;text-align:left}
        .ovl-acts{display:flex;gap:.4rem;flex-wrap:wrap}

        /* الأسعار */
        .ovl-plans{display:grid;gap:1.1rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr))}
        .ovl-plan{background:var(--panel);border:1px solid var(--line);border-radius:12px;
          padding:1.5rem 1.4rem;display:flex;flex-direction:column;position:relative;transition:border-color .2s}
        .ovl-plan:hover{border-color:var(--line-2)}
        .ovl-plan.best{border-color:var(--line-2)}
        .ovl-tag{position:absolute;top:-10px;right:1.3rem;font-family:'Oxanium',sans-serif;
          font-size:.66rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
          background:var(--grape);color:#fff;padding:.24rem .7rem;border-radius:5px}
        .ovl-plan h3{margin:0 0 .9rem;font-size:.95rem;font-weight:600;color:var(--ink)}
        .ovl-price{display:flex;align-items:baseline;gap:.35rem;margin-bottom:.25rem}
        .ovl-price b{font-family:'Oxanium',sans-serif;font-size:2.1rem;font-weight:800;color:var(--ink);
          line-height:1;font-variant-numeric:tabular-nums}
        .ovl-price span{font-size:.84rem;color:var(--ink-3)}
        .ovl-per{font-size:.82rem;color:var(--ink-3);margin:0 0 1.2rem}
        .ovl-per em{font-style:normal;color:var(--accent)}
        .ovl-plan ul{list-style:none;margin:0 0 1.4rem;padding:0;display:grid;gap:.5rem;flex:1}
        .ovl-plan li{display:flex;gap:.5rem;align-items:flex-start;font-size:.84rem;
          line-height:1.6;color:var(--ink-2)}
        .ovl-plan li svg{flex:none;margin-top:.2rem;color:var(--accent)}
        .ovl-plan .ovl-btn{width:100%;justify-content:center}
        .ovl-pay{display:flex;gap:1rem;flex-wrap:wrap;font-size:.82rem;color:var(--ink-3);margin-top:1.6rem}
        .ovl-pay b{color:var(--ink-2);font-weight:600}

        /* الألوان */
        .ovl-theme{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,.8fr);gap:2rem;align-items:start}
        .ovl-chips{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1.3rem}
        .ovl-chip{display:inline-flex;align-items:center;gap:.45rem;cursor:pointer;font-size:.85rem;
          padding:.5rem .95rem;border-radius:8px;background:rgba(127,58,161,.1);
          border:1px solid var(--line);color:var(--ink-2);transition:background .2s,color .2s,border-color .2s}
        .ovl-chip:hover{background:rgba(127,58,161,.24);color:var(--ink)}
        .ovl-chip[aria-pressed="true"]{background:rgba(127,58,161,.3);border-color:var(--line-2);color:var(--ink)}
        .ovl-chip i{width:11px;height:11px;border-radius:3px;flex:none}
        .ovl-screen{position:relative;aspect-ratio:16/9;border-radius:12px;overflow:hidden;
          border:1px solid var(--line);background:var(--panel-2)}
        .ovl-screen iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}
        .ovl-save{display:flex;align-items:center;gap:.8rem;flex-wrap:wrap}
        .ovl-ok{font-size:.83rem;color:var(--ok)}

        /* خطوات */
        .ovl-steps{counter-reset:s;display:grid;gap:.8rem}
        .ovl-stp{counter-increment:s;display:grid;grid-template-columns:auto 1fr;gap:.9rem;
          align-items:start;background:var(--panel);border:1px solid var(--line);
          border-radius:12px;padding:1.1rem 1.2rem}
        .ovl-stp::before{content:counter(s);font-family:'Oxanium',sans-serif;font-size:.8rem;font-weight:700;
          width:26px;height:26px;border-radius:7px;display:grid;place-items:center;
          background:rgba(127,58,161,.25);border:1px solid var(--line-2);color:var(--accent)}
        .ovl-stp b{display:block;color:var(--ink);font-size:.92rem;margin-bottom:.25rem;font-weight:600}
        .ovl-stp p{margin:0;font-size:.85rem;line-height:1.75;color:var(--ink-3)}
        .ovl-stp code{font-family:'Oxanium',monospace;font-size:.85em;direction:ltr;display:inline-block;
          background:rgba(127,58,161,.2);color:var(--ink-2);padding:.08em .38em;border-radius:4px}

        /* أسئلة */
        .ovl-faq{display:grid;gap:.6rem;max-width:780px}
        .ovl-qa{background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden}
        .ovl-qa.open{border-color:var(--line-2)}
        .ovl-q{width:100%;text-align:right;cursor:pointer;background:none;border:0;
          padding:1rem 1.2rem;font-size:.92rem;font-weight:600;color:var(--ink);
          display:flex;justify-content:space-between;align-items:center;gap:1rem}
        .ovl-q i{color:var(--accent);font-style:normal;transition:transform .25s;flex:none;font-size:.8rem}
        .ovl-qa.open .ovl-q i{transform:rotate(180deg)}
        .ovl-a{padding:0 1.2rem 1.15rem;margin:0;font-size:.87rem;line-height:1.9;color:var(--ink-3)}

        /* الحساب */
        .ovl-rows{display:grid;gap:.7rem;max-width:600px}
        .ovl-row{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;
          background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:1rem 1.2rem}
        .ovl-row span{font-size:.84rem;color:var(--ink-3)}
        .ovl-row b{color:var(--ink);font-size:.9rem;font-weight:600;direction:ltr}

        /* حالة فاضية */
        .ovl-none{border:1px dashed var(--line);border-radius:12px;padding:3rem 1.5rem;text-align:center}
        .ovl-none b{display:block;font-family:'Oxanium','29LtBukra',sans-serif;color:var(--ink);
          font-size:1rem;margin-bottom:.5rem}
        .ovl-none p{margin:0 auto;max-width:44ch;font-size:.87rem;line-height:1.8;color:var(--ink-3)}

        /* موبايل */
        .ovl-scrim{display:none}
        @media(max-width:900px){
          .ovl-side{transform:translateX(100%);transition:transform .25s}
          .ovl-side.open{transform:none}
          .ovl-main{margin-inline-end:0}
          .ovl-burger{display:grid}
          .ovl-scrim.on{display:block;position:fixed;inset:0;z-index:35;background:rgba(6,2,14,.7)}
          .ovl-body{padding:1.4rem 1rem 3.5rem}
          .ovl-theme{grid-template-columns:1fr}
        }
        @media(prefers-reduced-motion:reduce){.ovl *{transition:none!important;animation:none!important}}
      `}</style>

      {/* ── الشريط الجانبي ──────────────────────────────── */}
      <aside className={`ovl-side${menu ? ' open' : ''}`}>
        <div className="ovl-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.webp" alt="Tilago" width={63} height={42} />
          <b>TILAGO OVERLAY</b>
        </div>

        <nav className="ovl-nav">
          {NAV.map(n => (
            <button
              key={n.key} type="button"
              aria-current={section === n.key}
              onClick={() => { setSection(n.key); setMenu(false); }}
            >
              <n.Icon size={17} />
              {n.name}
              {n.key === 'overlays' && overlays.length > 0 && (
                <span className="ovl-badge">{overlays.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="ovl-side-foot">
          <Link href="/">الرجوع للمتجر</Link>
          <Link href="/contact">تواصل معنا</Link>
        </div>
      </aside>

      <div className={`ovl-scrim${menu ? ' on' : ''}`} onClick={() => setMenu(false)} />

      {/* ── المنطقة الرئيسية ────────────────────────────── */}
      <div className="ovl-main">
        <header className="ovl-bar">
          <div className="ovl-status">
            <i className={`ovl-dot ${!sub ? '' : !live ? 'off' : left !== null && left <= 7 ? 'soon' : 'on'}`} />
            {!sub ? <span>مفيش اشتراك</span>
              : !live ? <span>الاشتراك متوقف</span>
              : <span><b>{PLAN_NAME[sub.plan] ?? sub.plan}</b> · فاضل {left} يوم</span>}
          </div>

          <div className="ovl-who">
            {email ? <span>{email}</span> : <Link className="ovl-btn sm ghost" href="/auth/signin?callbackUrl=/overlay">تسجيل الدخول</Link>}
            <button type="button" className="ovl-burger" onClick={() => setMenu(m => !m)} aria-label="القائمة">
              {menu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>

        <main className="ovl-body">
          {/* ── التركيبات ─────────────────────────────── */}
          {section === 'overlays' && (
            <>
              <h1 className="ovl-h">
                {overlays.length > 0 ? `${overlays.length} تركيبة في مكتبتك` : 'المكتبة بتتجهّز'}
              </h1>
              <p className="ovl-p">
                كل تركيبة ليها رابط خاص بيك. انسخه وحطه في OBS كـ Browser Source، ودوس
                «جرّب» قبل البث عشان تتأكد إنها بترد.
              </p>

              {(sub || overlays.length > 0) && (
                <div className="ovl-ready">
                  <span className="ovl-ready-t">
                    <Sparkles size={16} /> جاهزيتك <b>{doneCount}/{steps.length}</b>
                  </span>
                  <ul>
                    {steps.map(s => (
                      <li key={s.label} className={s.done ? 'on' : ''}>
                        <i>{s.done ? '✓' : ''}</i>{s.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {overlays.length > 0 && (
                <div className="ovl-tabs" role="group" aria-label="تصنيفات">
                  <button type="button" className="ovl-tab" aria-pressed={cat === 'ALL'}
                    onClick={() => setCat('ALL')}>الكل <b>{counts.ALL}</b></button>
                  {CATS.filter(c => counts[c.key]).map(c => (
                    <button key={c.key} type="button" className="ovl-tab"
                      aria-pressed={cat === c.key} onClick={() => setCat(c.key)}>
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
                    const usable = live || o.isFree;
                    return (
                      <article className="ovl-o" key={o.id}>
                        <div className="ovl-o-head">
                          <h3>{o.title}</h3>
                          {catInfo && (
                            <span className="ovl-o-cat"><catInfo.Icon size={12} /> {catInfo.name}</span>
                          )}
                        </div>

                        <div className="ovl-prev">
                          <div className="ovl-flags">
                            {isNew(o.createdAt) && <span className="ovl-flag new">جديد</span>}
                            {o.isFree && <span className="ovl-flag free">مجانية</span>}
                          </div>
                          {o.poster
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={o.poster} alt="" loading="lazy" />
                            : <iframe
                                ref={el => { cardFrames.current[o.id] = el; }}
                                src={`${o.file}?demo=0`} title={o.title} loading="lazy" />}
                        </div>

                        <div className="ovl-o-body">
                          {o.description && <p>{o.description}</p>}

                          {usable && url ? (
                            <>
                              <div className="ovl-link">
                                <input readOnly value={url} onFocus={e => e.currentTarget.select()} />
                                <button type="button"
                                  className={`ovl-btn sm${copied === o.id ? ' done' : ''}`}
                                  onClick={() => copy(url, o.id)}>
                                  {copied === o.id ? <Check size={13} /> : <Copy size={13} />}
                                  {copied === o.id ? 'اتنسخ' : 'انسخ'}
                                </button>
                              </div>
                              <div className="ovl-acts">
                                <button type="button"
                                  className={`ovl-btn sm ghost${tested === o.id ? ' done' : ''}`}
                                  onClick={() => test(o)}>
                                  <Play size={13} /> {tested === o.id ? 'ردّت' : 'جرّب'}
                                </button>
                              </div>
                            </>
                          ) : (
                            <button type="button" className="ovl-btn sm"
                              onClick={() => setSection('plans')}>
                              <Zap size={13} /> اشترك عشان تاخد الرابط
                            </button>
                          )}
                        </div>
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
              <h1 className="ovl-h">ألوانك</h1>
              <p className="ovl-p">
                اختار اللون واحفظه. الرابط اللي في OBS مابيتغيّرش، والتركيبة بتتحدّث على بثك
                في نفس اللحظة — حتى لو غيّرته من موبايلك وانت لايف.
              </p>

              {!sub ? (
                <div className="ovl-none">
                  <b>الألوان بتيجي مع الاشتراك</b>
                  <p>اشترك وهتقدر تلوّن كل تركيباتك وتغيّرها وقت ما تحب.</p>
                </div>
              ) : (
                <div className="ovl-theme">
                  <div>
                    <div className="ovl-chips" role="group" aria-label="لون التركيبات">
                      {PALETTES.map(p => (
                        <button key={p.key} type="button" className="ovl-chip"
                          aria-pressed={palette === p.key} onClick={() => setPalette(p.key)}>
                          <i style={{ background: p.dot }} aria-hidden="true" />
                          {p.name}
                        </button>
                      ))}
                    </div>
                    <div className="ovl-save">
                      <button type="button" className="ovl-btn" onClick={saveTheme} disabled={saving}>
                        {saving ? 'بيحفظ…' : 'احفظ اللون'}
                      </button>
                      {saved && <span className="ovl-ok">اتحفظ، والتركيبات اتحدّثت</span>}
                    </div>
                  </div>

                  <div className="ovl-screen">
                    {demo ? (
                      <iframe ref={themeFrame}
                        src={`${demo.file}?demo=0&label=${encodeURIComponent('أكبر داعم')}&name=${encodeURIComponent(name || 'اسمك هنا')}&value=12500`}
                        title="معاينة ألوانك" loading="lazy" />
                    ) : (
                      <div style={{ display: 'grid', placeItems: 'center', height: '100%',
                                    fontSize: '.84rem', color: 'var(--ink-3)' }}>
                        المعاينة هتبان أول ما تنزل تركيبة
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── التركيب ───────────────────────────────── */}
          {section === 'install' && (
            <>
              <h1 className="ovl-h">حطها في OBS</h1>
              <p className="ovl-p">
                مفيش تنصيب ولا تحذير من ويندوز. العملية بتاخد أقل من دقيقة.
              </p>
              <div className="ovl-steps">
                <div className="ovl-stp">
                  <div>
                    <b>انسخ الرابط</b>
                    <p>من قسم التركيبات، كل واحدة ليها رابط خاص بيك وبألوانك. ضغطة واحدة وهو في الحافظة.</p>
                  </div>
                </div>
                <div className="ovl-stp">
                  <div>
                    <b>ضيف Browser Source</b>
                    <p>في OBS اختار <code>Sources</code> ثم <code>+</code> ثم <code>Browser</code>، والزق الرابط في خانة <code>URL</code>.</p>
                  </div>
                </div>
                <div className="ovl-stp">
                  <div>
                    <b>حط المقاس</b>
                    <p><code>Width 1920</code> و <code>Height 1080</code>، وبعدين <code>OK</code>. التركيبة بتظبط نفسها على أي مقاس تديهوله.</p>
                  </div>
                </div>
                <div className="ovl-stp">
                  <div>
                    <b>جرّبها قبل البث</b>
                    <p>ارجع لقسم التركيبات ودوس «جرّب». هتشوف التركيبة بترد على الشاشة. لو ردّت، انت جاهز.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── الاشتراك ──────────────────────────────── */}
          {section === 'plans' && (
            <>
              <h1 className="ovl-h">اشتراك واحد، المكتبة كلها</h1>
              <p className="ovl-p">
                مفيش باقات ولا مميزات مقفولة. أي تركيبة في المكتبة دلوقتي وأي واحدة هتنزل بعد كده،
                اشتراكك بياخدها.
              </p>

              <div className="ovl-plans">
                {PLANS.map(p => (
                  <div key={p.key} className={`ovl-plan${'best' in p && p.best ? ' best' : ''}`}>
                    {'best' in p && p.best && <span className="ovl-tag">الأوفر</span>}
                    <h3>{p.name}</h3>
                    <div className="ovl-price">
                      <b>{p.price.toLocaleString('en-US')}</b><span>جنيه</span>
                    </div>
                    <p className="ovl-per">يطلع الشهر بـ <em>{p.per} جنيه</em>. {p.note}</p>
                    <ul>
                      <li><Check size={14} />كل التركيبات في المكتبة</li>
                      <li><Check size={14} />الجديد أول ما ينزل</li>
                      <li><Check size={14} />ألوانك على كل تركيبة</li>
                      <li><Check size={14} />تغيير اللون وانت لايف</li>
                      <li><Check size={14} />دعم لما تحتاجه</li>
                    </ul>
                    <Link href="/contact" className={`ovl-btn${'best' in p && p.best ? '' : ' ghost'}`}>
                      {sub ? 'جدّد' : 'اشترك'}
                    </Link>
                  </div>
                ))}
              </div>

              <div className="ovl-pay">
                <span><b>الدفع:</b> انستاباي وفودافون كاش وبايبال</span>
                <span>فيزا وميزا قريباً</span>
                <span><ShieldCheck size={13} style={{ verticalAlign: '-2px' }} /> <b>استرجاع كامل</b> خلال 7 أيام لو مركّبتش</span>
              </div>
            </>
          )}

          {/* ── مساعدة ────────────────────────────────── */}
          {section === 'help' && (
            <>
              <h1 className="ovl-h">اللي بيتسأل كتير</h1>
              <p className="ovl-p">لو سؤالك مش هنا، ابعتلنا وهنرد عليك.</p>
              <div className="ovl-faq">
                {FAQ.map((f, i) => (
                  <div className={`ovl-qa${openFaq === i ? ' open' : ''}`} key={f.q}>
                    <button type="button" className="ovl-q" aria-expanded={openFaq === i}
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      {f.q}<i>▾</i>
                    </button>
                    {openFaq === i && <p className="ovl-a">{f.a}</p>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── الحساب ────────────────────────────────── */}
          {section === 'account' && (
            <>
              <h1 className="ovl-h">حسابك</h1>
              <p className="ovl-p">بيانات اشتراكك وحالته.</p>

              {!email ? (
                <div className="ovl-none">
                  <b>مش مسجّل دخول</b>
                  <p>سجّل دخولك بجوجل عشان تشوف اشتراكك وروابطك.</p>
                  <Link className="ovl-btn" href="/auth/signin?callbackUrl=/overlay"
                    style={{ marginTop: '1.2rem' }}>تسجيل الدخول بجوجل</Link>
                </div>
              ) : (
                <div className="ovl-rows">
                  <div className="ovl-row">
                    <span>الإيميل</span><b>{email}</b>
                  </div>
                  {name && <div className="ovl-row"><span>الاسم</span><b>{name}</b></div>}
                  <div className="ovl-row">
                    <span>الاشتراك</span>
                    <b>{!sub ? 'مفيش' : `${PLAN_NAME[sub.plan] ?? sub.plan}${live ? '' : ' (متوقف)'}`}</b>
                  </div>
                  {sub?.endsAt && (
                    <div className="ovl-row">
                      <span>بيخلص في</span>
                      <b><Clock size={13} style={{ verticalAlign: '-2px' }} /> {fmtDate(sub.endsAt)}</b>
                    </div>
                  )}
                  {live && left !== null && (
                    <div className="ovl-row"><span>الأيام الفاضلة</span><b>{left} يوم</b></div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

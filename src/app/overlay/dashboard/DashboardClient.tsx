'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

export type OverlayCategory = 'SUPPORTERS' | 'CHALLENGES' | 'GOALS' | 'DECOR';

export interface DashOverlay {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: OverlayCategory;
  file: string;
  poster: string | null;
  isFree: boolean;
  createdAt: string;
}

export type DashSub = {
  plan: string;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  token: string;
  theme: Record<string, string> | null;
} | null;

const PALETTES = [
  { key: 'violet', name: 'بنفسجي', dot: '#a855f7', vars: { violet: '#a855f7', 'violet-hot': '#e9d5ff' } },
  { key: 'fire',   name: 'ناري',   dot: '#f43f5e', vars: { violet: '#f43f5e', 'violet-hot': '#ffd7dd' } },
  { key: 'gold',   name: 'ذهبي',   dot: '#e9b84a', vars: { violet: '#e9b84a', 'violet-hot': '#fff0c4' } },
  { key: 'ice',    name: 'جليدي',  dot: '#38bdf8', vars: { violet: '#38bdf8', 'violet-hot': '#d8f2ff' } },
  { key: 'toxic',  name: 'سام',    dot: '#4ade80', vars: { violet: '#4ade80', 'violet-hot': '#dcffe8' } },
  { key: 'rose',   name: 'وردي',   dot: '#fb7185', vars: { violet: '#fb7185', 'violet-hot': '#ffe0e6' } },
] as const;

const CAT_NAME: Record<OverlayCategory, string> = {
  SUPPORTERS: 'داعمين', CHALLENGES: 'تحديات', GOALS: 'أهداف', DECOR: 'تزيين',
};

const PLAN_NAME: Record<string, string> = {
  m1: 'شهري', m3: '3 شهور', y: 'سنوي',
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });

/** الأيام الفاضلة — التذكير بييجي منك يدوي، فالعدّاد ده هو اللي بيخلي
    العميل يعرف لوحده قبل ما يتفاجئ */
function daysLeft(endsAt: string | null): number | null {
  if (!endsAt) return null;
  return Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000);
}

export default function DashboardClient({
  name, email, sub, overlays,
}: {
  name: string | null;
  email: string;
  sub: DashSub;
  overlays: DashOverlay[];
}) {
  const initial = useMemo(() => {
    const v = sub?.theme?.violet;
    return PALETTES.find(p => p.vars.violet === v)?.key ?? 'violet';
  }, [sub]);

  const [palette, setPalette] = useState<string>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const frame = useRef<HTMLIFrameElement | null>(null);

  const active = useMemo(
    () => PALETTES.find(p => p.key === palette) ?? PALETTES[0],
    [palette],
  );

  const left = daysLeft(sub?.endsAt ?? null);
  const isLive = sub?.status === 'active' && (left === null || left > 0);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  /* المعاينة بتتغيّر فوراً وانت بتختار، قبل الحفظ */
  useEffect(() => {
    frame.current?.contentWindow?.postMessage(
      { type: 'plate-theme', vars: active.vars }, '*',
    );
  }, [active]);

  async function saveTheme() {
    setSaving(true); setSaved(false);
    try {
      const res = await fetch('/api/account/overlay-theme', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ theme: active.vars }),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2600); }
    } finally {
      setSaving(false);
    }
  }

  async function copy(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* المتصفح رفض النسخ — الرابط ظاهر في الخانة والعميل يقدر يعلّم عليه */
    }
  }

  const linkFor = (o: DashOverlay) =>
    sub ? `${origin}/o/${sub.token}/${o.slug}` : '';

  return (
    <div className="dz" dir="rtl">
      <style>{`
        .dz{
          --deep:#0C0516; --navy:#0F083B; --grape:#5416B5; --violet:#7F3AA1;
          --ink:#e8e4f8; --ink-2:#a09abf; --ink-3:#7d76a0; --accent:#9B59D0;
          --line:rgba(84,22,181,0.2); --line-hot:rgba(84,22,181,0.5);
          --card:rgba(15,8,59,0.5);
          --ok:#4ade80; --warn:#fbbf24; --bad:#fb7185;
          min-height:100vh;padding:2.6rem 5% 5rem;
          background:linear-gradient(var(--navy),var(--deep));
          color:var(--ink-2);
          font-family:'Cairo','29LtBukra','Montserrat',sans-serif;
        }
        .dz-in{width:min(96%,1180px);margin:0 auto}

        .dz h1{
          font-family:'29LtBukra','Cairo',sans-serif;font-size:clamp(1.4rem,3vw,1.9rem);
          font-weight:700;line-height:1.45;color:var(--ink);margin:0 0 .3rem;
        }
        .dz-sub{font-size:.88rem;color:var(--ink-3);margin:0 0 2rem;direction:ltr;text-align:right}

        .dz h2{
          font-family:'Oxanium','29LtBukra',sans-serif;font-size:1.15rem;font-weight:700;
          color:var(--ink);margin:0 0 .4rem;
        }
        .dz-lede{font-size:.9rem;line-height:1.8;color:var(--ink-2);margin:0 0 1.4rem;max-width:58ch}
        section{margin-bottom:2.8rem}

        .dz-btn{
          display:inline-flex;align-items:center;gap:.5rem;cursor:pointer;
          font-family:'Cairo',sans-serif;font-size:.9rem;font-weight:600;
          padding:.65rem 1.5rem;border-radius:50px;border:none;
          background:linear-gradient(135deg,var(--grape),var(--violet));color:#fff;
          box-shadow:0 4px 14px rgba(0,0,0,.45);transition:all .3s;text-decoration:none;
        }
        .dz-btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.55)}
        .dz-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}
        .dz-btn.ghost{
          background:rgba(84,22,181,.18);border:1px solid var(--line);
          color:var(--ink);box-shadow:none;
        }
        .dz-btn.ghost:hover{background:rgba(84,22,181,.32);border-color:var(--line-hot)}
        .dz-btn:focus-visible,.dz-chip:focus-visible,.dz-copy:focus-visible,
        .dz-link input:focus-visible{outline:2px solid var(--violet);outline-offset:2px}

        /* حالة الاشتراك */
        .dz-state{
          background:var(--card);border:1px solid var(--line);border-radius:14px;
          padding:1.5rem 1.6rem;margin-bottom:2.4rem;
          display:flex;align-items:center;justify-content:space-between;
          gap:1.4rem;flex-wrap:wrap;
        }
        .dz-state.off{border-color:rgba(251,113,133,.35)}
        .dz-state-l{display:flex;align-items:center;gap:1rem;flex-wrap:wrap}
        .dz-dot{width:10px;height:10px;border-radius:50%;flex:none;background:var(--ink-3)}
        .dz-dot.live{background:var(--ok)}
        .dz-dot.soon{background:var(--warn)}
        .dz-dot.dead{background:var(--bad)}
        .dz-state b{
          display:block;font-family:'Oxanium','29LtBukra',sans-serif;
          color:var(--ink);font-size:1rem;font-weight:700;margin-bottom:.15rem;
        }
        .dz-state span{font-size:.84rem;color:var(--ink-3)}
        .dz-left{
          font-family:'Oxanium',sans-serif;font-variant-numeric:tabular-nums;
          font-size:1.8rem;font-weight:800;color:var(--accent);line-height:1;
        }
        .dz-left small{display:block;font-size:.72rem;font-weight:400;color:var(--ink-3);margin-top:.25rem}

        /* الألوان */
        .dz-theme{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.85fr);gap:2rem;align-items:center}
        .dz-chips{display:flex;gap:.55rem;flex-wrap:wrap;margin-bottom:1.4rem}
        .dz-chip{
          display:inline-flex;align-items:center;gap:.5rem;cursor:pointer;
          padding:.55rem 1rem;border-radius:50px;
          background:rgba(84,22,181,0.14);border:1px solid var(--line);
          color:var(--ink-2);font-family:'Cairo',sans-serif;font-size:.87rem;transition:all .22s;
        }
        .dz-chip:hover{background:rgba(84,22,181,0.3);color:var(--ink)}
        .dz-chip[aria-pressed="true"]{background:rgba(84,22,181,.36);border-color:var(--line-hot);color:var(--ink)}
        .dz-chip i{width:12px;height:12px;border-radius:50%;flex:none}
        .dz-save{display:flex;align-items:center;gap:.8rem;flex-wrap:wrap}
        .dz-ok{font-size:.84rem;color:var(--ok)}
        .dz-screen{
          position:relative;border-radius:14px;overflow:hidden;aspect-ratio:16/9;
          border:1px solid var(--line);background:linear-gradient(160deg,#150c2b,#0a0418);
        }
        .dz-screen iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}

        /* التركيبات */
        .dz-list{display:grid;gap:1.1rem}
        .dz-item{
          background:var(--card);border:1px solid var(--line);border-radius:14px;
          padding:1.1rem 1.2rem;display:grid;
          grid-template-columns:150px minmax(0,1fr);gap:1.2rem;align-items:center;
          transition:all .3s ease;
        }
        .dz-item:hover{border-color:var(--line-hot)}
        .dz-thumb{
          position:relative;aspect-ratio:16/9;border-radius:10px;overflow:hidden;
          border:1px solid var(--line);background:linear-gradient(160deg,#150c2b,#0a0418);
        }
        .dz-thumb iframe,.dz-thumb img{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}
        .dz-thumb img{object-fit:cover}
        .dz-item h3{
          font-family:'Oxanium','29LtBukra',sans-serif;font-size:1rem;font-weight:700;
          color:var(--ink);margin:0 0 .2rem;
        }
        .dz-tags{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.7rem}
        .dz-tag{
          font-family:'Oxanium',sans-serif;font-size:.68rem;font-weight:700;
          letter-spacing:.08em;text-transform:uppercase;
          padding:.18rem .5rem;border-radius:50px;
          background:rgba(84,22,181,.2);border:1px solid var(--line);color:var(--ink-3);
        }
        .dz-tag.free{color:#a7f3c8;border-color:rgba(74,222,128,.4)}

        .dz-link{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
        .dz-link input{
          flex:1;min-width:180px;padding:.55rem .8rem;border-radius:10px;
          background:rgba(12,5,22,.62);border:1px solid var(--line);
          color:var(--ink-2);font-family:'Oxanium',monospace;font-size:.8rem;
          direction:ltr;text-align:left;
        }
        .dz-copy{
          display:inline-flex;align-items:center;gap:.4rem;cursor:pointer;flex:none;
          font-family:'Cairo',sans-serif;font-size:.82rem;
          padding:.55rem 1rem;border-radius:10px;
          background:rgba(84,22,181,.22);border:1px solid var(--line);
          color:var(--ink);transition:all .22s;
        }
        .dz-copy:hover{background:rgba(84,22,181,.4);border-color:var(--line-hot)}
        .dz-copy.done{color:var(--ok);border-color:rgba(74,222,128,.4)}

        .dz-empty{
          border:1px dashed var(--line);border-radius:14px;padding:3rem 1.6rem;text-align:center;
        }
        .dz-empty b{
          display:block;font-family:'Oxanium','29LtBukra',sans-serif;color:var(--ink);
          font-size:1.05rem;margin-bottom:.5rem;
        }
        .dz-empty p{margin:0 auto 1.4rem;max-width:46ch;font-size:.9rem;line-height:1.8;color:var(--ink-2)}

        .dz-help{
          background:var(--card);border:1px solid var(--line);border-radius:14px;
          padding:1.3rem 1.5rem;
        }
        .dz-help ol{margin:0;padding-inline-start:1.2rem;display:grid;gap:.55rem}
        .dz-help li{font-size:.88rem;line-height:1.8;color:var(--ink-2)}
        .dz-help code{
          font-family:'Oxanium',monospace;font-size:.86em;direction:ltr;display:inline-block;
          background:rgba(84,22,181,.2);color:var(--ink);padding:.1em .4em;border-radius:5px;
        }

        @media(max-width:860px){
          .dz-theme{grid-template-columns:1fr}
          .dz-item{grid-template-columns:1fr}
          .dz-thumb{max-width:240px}
        }
        @media(prefers-reduced-motion:reduce){.dz *{animation:none!important;transition:none!important}}
      `}</style>

      <div className="dz-in">
        <h1>{name ? `أهلاً ${name}` : 'تركيباتي'}</h1>
        <p className="dz-sub">{email}</p>

        {/* ── حالة الاشتراك ─────────────────────────────── */}
        <div className={`dz-state${isLive ? '' : ' off'}`}>
          <div className="dz-state-l">
            <span className={`dz-dot ${
              !sub ? '' : !isLive ? 'dead' : left !== null && left <= 7 ? 'soon' : 'live'
            }`} />
            <div>
              {!sub ? (
                <>
                  <b>مفيش اشتراك</b>
                  <span>اشترك عشان تاخد روابط التركيبات</span>
                </>
              ) : !isLive ? (
                <>
                  <b>الاشتراك متوقف</b>
                  <span>
                    {sub.status === 'pending'
                      ? 'دفعتك وصلت وبنأكّدها، هنفعّل الاشتراك قريب'
                      : sub.endsAt ? `انتهى في ${fmtDate(sub.endsAt)}` : 'جدّد عشان الروابط ترجع'}
                  </span>
                </>
              ) : (
                <>
                  <b>اشتراك {PLAN_NAME[sub.plan] ?? sub.plan} شغّال</b>
                  <span>{sub.endsAt ? `بيخلص في ${fmtDate(sub.endsAt)}` : 'بدون تاريخ انتهاء'}</span>
                </>
              )}
            </div>
          </div>

          {isLive && left !== null ? (
            <div className="dz-left">{left}<small>يوم فاضل</small></div>
          ) : (
            <Link href="/overlay#plans" className="dz-btn">
              {sub ? 'جدّد الاشتراك' : 'ابدأ الاشتراك'}
            </Link>
          )}
        </div>

        {/* ── الألوان ───────────────────────────────────── */}
        {sub && (
          <section>
            <h2>ألوانك</h2>
            <p className="dz-lede">
              اختار اللون واحفظه. الرابط اللي في OBS مابيتغيّرش، والتركيبة بتتحدّث على بثك
              في نفس اللحظة — حتى لو غيّرته من موبايلك وانت لايف.
            </p>
            <div className="dz-theme">
              <div>
                <div className="dz-chips" role="group" aria-label="لون التركيبات">
                  {PALETTES.map(p => (
                    <button
                      key={p.key} type="button" className="dz-chip"
                      aria-pressed={palette === p.key}
                      onClick={() => setPalette(p.key)}
                    >
                      <i style={{ background: p.dot }} aria-hidden="true" />
                      {p.name}
                    </button>
                  ))}
                </div>
                <div className="dz-save">
                  <button type="button" className="dz-btn" onClick={saveTheme} disabled={saving}>
                    {saving ? 'بيحفظ…' : 'احفظ اللون'}
                  </button>
                  {saved && <span className="dz-ok">اتحفظ، والتركيبات اتحدّثت</span>}
                </div>
              </div>

              <div className="dz-screen">
                <iframe
                  ref={frame}
                  src={`${overlays[0].file}?label=${
                    encodeURIComponent('أكبر داعم')}&name=${
                    encodeURIComponent(name || 'اسمك هنا')}&value=12500`}
                  title="معاينة ألوانك"
                  loading="lazy"
                />
              </div>
            </div>
          </section>
        )}

        {/* ── التركيبات وروابطها ────────────────────────── */}
        <section>
          <h2>تركيباتك</h2>
          {overlays.length === 0 ? (
            <div className="dz-empty">
              <b>المكتبة بتتجهّز</b>
              <p>أول التركيبات في الطريق. أول ما تنزل هتلاقيها هنا بروابطها جاهزة.</p>
            </div>
          ) : !sub ? (
            <div className="dz-empty">
              <b>الروابط بتيجي مع الاشتراك</b>
              <p>
                {overlays.length} تركيبة مستنياك. اشترك وهتلاقي رابط كل واحدة هنا جاهز
                تلزقه في OBS.
              </p>
              <Link href="/overlay#plans" className="dz-btn">شوف الاشتراكات</Link>
            </div>
          ) : (
            <div className="dz-list">
              {overlays.map(o => {
                const url = linkFor(o);
                const usable = isLive || o.isFree;
                return (
                  <div className="dz-item" key={o.id}>
                    <div className="dz-thumb">
                      {o.poster
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={o.poster} alt="" loading="lazy" />
                        : <iframe src={o.file} title={o.title} loading="lazy" />}
                    </div>
                    <div>
                      <h3>{o.title}</h3>
                      <div className="dz-tags">
                        <span className="dz-tag">{CAT_NAME[o.category]}</span>
                        {o.isFree && <span className="dz-tag free">مجانية</span>}
                        {!usable && <span className="dz-tag">محتاجة اشتراك</span>}
                      </div>
                      <div className="dz-link">
                        <input readOnly value={url} onFocus={e => e.currentTarget.select()} />
                        <button
                          type="button"
                          className={`dz-copy${copied === o.id ? ' done' : ''}`}
                          onClick={() => copy(url, o.id)}
                        >
                          {copied === o.id ? 'اتنسخ' : 'انسخ'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── التركيب ───────────────────────────────────── */}
        <section>
          <h2>إزاي تحطها في OBS</h2>
          <div className="dz-help">
            <ol>
              <li>انسخ رابط التركيبة من فوق.</li>
              <li>في OBS: <code>Sources</code> ثم <code>+</code> ثم <code>Browser</code>.</li>
              <li>الزق الرابط في خانة <code>URL</code>.</li>
              <li>حط المقاس <code>1920</code> × <code>1080</code> واضغط <code>OK</code>.</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}

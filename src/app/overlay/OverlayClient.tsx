'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

/* ── الباليتات ────────────────────────────────────────────────
   العميل بيختار بالإحساس مش بكود لون. كل واحدة زوج متناسق:
   اللون الأساسي واللون الفاتح اللي النص بيتدرّج ليه. */
const PALETTES = [
  { key: 'violet', name: 'بنفسجي', dot: '#a855f7', vars: { violet: '#a855f7', 'violet-hot': '#e9d5ff' } },
  { key: 'fire',   name: 'ناري',   dot: '#f43f5e', vars: { violet: '#f43f5e', 'violet-hot': '#ffd7dd' } },
  { key: 'gold',   name: 'ذهبي',   dot: '#e9b84a', vars: { violet: '#e9b84a', 'violet-hot': '#fff0c4' } },
  { key: 'ice',    name: 'جليدي',  dot: '#38bdf8', vars: { violet: '#38bdf8', 'violet-hot': '#d8f2ff' } },
  { key: 'toxic',  name: 'سام',    dot: '#4ade80', vars: { violet: '#4ade80', 'violet-hot': '#dcffe8' } },
  { key: 'rose',   name: 'وردي',   dot: '#fb7185', vars: { violet: '#fb7185', 'violet-hot': '#ffe0e6' } },
] as const;

const CATEGORIES = [
  { key: 'supporters', name: 'داعمين',  desc: 'ترتيب أكتر ناس بتدعمك، بيتحدّث مع كل هدية' },
  { key: 'challenges', name: 'تحديات',  desc: 'سباق بين متابعينك يرفع الحماس والتفاعل' },
  { key: 'goals',      name: 'أهداف',   desc: 'شريط بيتملّي قدام الجمهور لما يقربوا من الهدف' },
  { key: 'decor',      name: 'تزيين',   desc: 'إطارات وشاشات وفواصل تخلي البث شكله مظبوط' },
] as const;

const PLANS = [
  { key: 'm3',  name: '3 شهور', price: 749,   per: 250, note: 'وفّر 16%' },
  { key: 'y',   name: 'سنوي',   price: 2399,  per: 200, note: 'ادفع 8 شهور وخد سنة', best: true },
  { key: 'm1',  name: 'شهري',   price: 299,   per: 299, note: 'من غير التزام' },
] as const;

const FAQ = [
  {
    q: 'إزاي بحطها في OBS؟',
    a: 'بتنسخ الرابط من حسابك، وتضيف Browser Source جديد في OBS، وتلزقه. مفيش تحميل ولا تنصيب ولا إعدادات معقّدة. العملية بتاخد أقل من دقيقة، وفيه فيديو قصير بيوريك الخطوات على شاشة OBS حقيقية.',
  },
  {
    q: 'محتاج أنزّل برنامج على جهازي؟',
    a: 'لا. التركيبة بتشتغل من الرابط مباشرة جوه OBS. مفيش ملف تنزّله، ومفيش تحذير من ويندوز، ومفيش حاجة تاخد من مساحة جهازك.',
  },
  {
    q: 'أقدر أغيّر الألوان بعد ما أركّبها؟',
    a: 'أيوه، والرابط مابيتغيّرش. تفتح حسابك من أي جهاز حتى موبايلك، تغيّر اللون، والتركيبة بتتغيّر على البث في نفس اللحظة من غير ما تلمس OBS.',
  },
  {
    q: 'التركيبات الجديدة بتوصلني إزاي؟',
    a: 'بتلاقيها في حسابك أول ما تنزل. الاشتراك بياخد كل حاجة في المكتبة، القديم والجديد، من غير أي دفع إضافي.',
  },
  {
    q: 'لو الاشتراك خلص وأنا بابث؟',
    a: 'التركيبة بتتحول لشفافة وبتظهر رسالة صغيرة ليك انت بس. جمهورك مش هيشوف مربع أبيض ولا خطأ على الشاشة.',
  },
  {
    q: 'ينفع أشارك حسابي مع صاحبي؟',
    a: 'الحساب لبث واحد في نفس الوقت. لو اتفتح من مكانين مع بعض، التاني بيترفض. ده بيحمي اشتراكك من إنه يتستخدم من غير علمك.',
  },
] as const;

const OVERLAY_SRC = '/overlays/qatar-plate.html';

export default function OverlayClient() {
  const [palette, setPalette] = useState<string>('violet');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const tryFrame = useRef<HTMLIFrameElement | null>(null);

  const active = useMemo(
    () => PALETTES.find(p => p.key === palette) ?? PALETTES[0],
    [palette],
  );

  /* تغيير اللون بيتبعت للتركيبة وهي شغّالة. مفيش إعادة تحميل،
     فالأنيميشن مابيتقطعش والفيديو مابيرجعش من أوله. */
  useEffect(() => {
    tryFrame.current?.contentWindow?.postMessage(
      { type: 'plate-theme', vars: active.vars },
      '*',
    );
  }, [active]);

  return (
    <div className="ov" dir="rtl">
      <style>{`
        /* ملف الستايل ده بيمشي على نظام الموقع زي ما هو:
           نفس الخطوط، نفس تدرّج الأزرار، نفس كارت صفحة الاليرتات
           (زاوية 14px وتدرّج راديال من فوق وهوفر بيرفع 6px). */
        .ov{
          --deep:#0C0516; --navy:#0F083B; --grape:#5416B5; --violet:#7F3AA1;
          --ink:#e8e4f8; --ink-2:#a09abf; --ink-3:#7d76a0;
          --accent:#9B59D0;
          --line:rgba(84,22,181,0.2);
          --line-hot:rgba(84,22,181,0.5);
          --card:rgba(15,8,59,0.5);
                    color:var(--ink-2);
          font-family:'Cairo','29LtBukra','Montserrat',sans-serif;
          background:var(--deep);
          overflow-x:hidden;
        }
        .ov section{padding:5rem 5%}
        .ov-in{width:min(94%,1500px);margin:0 auto}

        .ov h2{
          font-family:'Oxanium','29LtBukra',sans-serif;
          font-size:clamp(1.5rem,3.4vw,2.1rem);font-weight:800;
          color:var(--ink);margin:0 0 .6rem;line-height:1.3;
        }
        .ov .ov-lede{color:var(--ink-2);font-size:1rem;line-height:1.8;margin:0 0 2.4rem;max-width:56ch}

        /* شارة صغيرة فوق كل عنوان، بتقول القسم ده بيعمل إيه */
        .ov-kicker{
          font-family:'Oxanium',sans-serif;font-size:.74rem;font-weight:700;
          letter-spacing:.2em;text-transform:uppercase;color:var(--accent);
          display:block;margin-bottom:.7rem;
        }

        .ov-cta{
          display:inline-block;padding:.9rem 2.2rem;
          background:linear-gradient(135deg,var(--grape),var(--violet));
          color:#fff;font-weight:600;font-size:1rem;
          border:none;border-radius:50px;cursor:pointer;
          box-shadow:0 4px 14px rgba(0,0,0,0.45);
          transition:all .3s;text-transform:uppercase;letter-spacing:1px;
          text-decoration:none;font-family:'Oxanium',sans-serif;
        }
        .ov-cta:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,0.55)}
        .ov-cta.ov-ghost{
          background:rgba(84,22,181,0.18);border:1px solid var(--line);
          box-shadow:none;color:var(--ink);
        }
        .ov-cta.ov-ghost:hover{background:rgba(84,22,181,0.32);border-color:var(--line-hot)}
        .ov-cta:focus-visible,.ov-chip:focus-visible,.ov-q:focus-visible{outline:2px solid var(--violet);outline-offset:3px}

        /* ── المقدمة ─────────────────────────────────────────
           التركيبة محطوطة على سطح شبه شاشة بث، عشان الزائر يفهم
           من غير شرح إنها بتركب فوق بثه هو مش صورة في إطار. */
        .ov-hero{
          padding:2.4rem 0 4.5rem;text-align:center;
          background:linear-gradient(var(--navy), var(--deep));
          border-bottom:1px solid var(--line);
        }
        /* الصورة نسبتها 2.33:1، فبتاخد عرض الصفحة بدل ما تتحشر في عمود
           جانبي وتضيع تفاصيلها. الأبعاد مكتوبة عشان المكان يتحجز قبل
           ما تحمّل والصفحة ماتنطش. */
        .ov-banner{
          display:block;width:min(96%,1500px);height:auto;
          margin:0 auto 2.6rem;border-radius:18px;
        }
        .ov-copy{width:min(92%,760px);margin:0 auto}
        .ov-screen{
          position:relative;border-radius:16px;overflow:hidden;
          border:1px solid rgba(155,89,208,0.28);
          box-shadow:0 24px 60px rgba(0,0,0,0.65);
          aspect-ratio:16/9;
          background:linear-gradient(160deg,#150c2b,#0a0418);
        }
        .ov-screen iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}
        /* شارة "مباشر" — إشارة إن اللي بتشوفه شغّال دلوقتي مش لقطة */
        .ov-live{
          position:absolute;top:12px;right:12px;z-index:2;
          display:inline-flex;align-items:center;gap:7px;
          font-family:'Oxanium',sans-serif;font-size:.7rem;font-weight:700;
          letter-spacing:.14em;text-transform:uppercase;color:#fff;
          background:rgba(12,5,22,.62);backdrop-filter:blur(6px);
          border:1px solid rgba(255,255,255,.16);
          padding:.32rem .7rem;border-radius:50px;
        }
        .ov-live i{width:7px;height:7px;border-radius:50%;background:#f43f5e;animation:pulse 2s infinite}
        @keyframes pulse{50%{opacity:.25}}

        /* وزن 700 مش 800: خط 29LtBukra عنده 300 و400 و700 بس، فطلب 800
           كان بيخلي المتصفح يسمّن الحروف صناعياً وتطلع حوافها مش مظبوطة. */
        .ov-hero h1{
          font-family:'29LtBukra','Cairo',sans-serif;
          font-size:clamp(1.6rem,3.4vw,2.45rem);font-weight:700;
          line-height:1.45;letter-spacing:-.01em;
          color:var(--ink);margin:0 0 1rem;text-wrap:balance;
        }
        .ov-hero p{font-size:1.06rem;line-height:1.9;color:var(--ink-2);margin:0 auto 1.9rem;max-width:52ch}
        .ov-hero-btns{display:flex;gap:.8rem;flex-wrap:wrap;justify-content:center}
        .ov-hero-facts{
          display:flex;gap:2.4rem;flex-wrap:wrap;justify-content:center;
          margin:2.6rem auto 0;padding-top:1.7rem;
          border-top:1px solid var(--line);width:min(92%,760px);
        }
        .ov-fact b{
          font-family:'Oxanium',sans-serif;font-size:1.5rem;font-weight:800;
          color:var(--accent);display:block;line-height:1.2;
        }
        .ov-fact span{font-size:.82rem;color:var(--ink-3);letter-spacing:.5px}

        /* ── الأسعار ────────────────────────────────────────── */
        .ov-plans{
          display:grid;gap:1.4rem;align-items:stretch;
          grid-template-columns:repeat(auto-fit,minmax(min(100%,270px),1fr));
        }
        .ov-plan{
          position:relative;background:var(--card);
          border:1px solid var(--line);border-radius:14px;
          padding:2rem 1.7rem 1.8rem;
          transition:all .3s ease;
          display:flex;flex-direction:column;
        }
        .ov-plan:hover{transform:translateY(-6px);border-color:var(--line-hot);box-shadow:0 8px 24px rgba(0,0,0,0.5)}
        .ov-plan.ov-best{border-color:rgba(155,89,208,.55);box-shadow:0 10px 30px rgba(0,0,0,0.55)}
        .ov-plan-tag{
          position:absolute;top:-11px;right:1.5rem;
          font-family:'Oxanium',sans-serif;font-size:.68rem;font-weight:700;
          letter-spacing:.14em;text-transform:uppercase;
          background:linear-gradient(135deg,var(--grape),var(--violet));color:#fff;
          padding:.28rem .8rem;border-radius:50px;
        }
        .ov-plan h3{font-family:'Oxanium',sans-serif;font-size:1.05rem;color:var(--ink);margin:0 0 1rem;font-weight:700}
        .ov-price{display:flex;align-items:baseline;gap:.4rem;margin-bottom:.3rem}
        .ov-price b{
          font-family:'Oxanium',sans-serif;font-size:2.5rem;font-weight:800;
          color:var(--ink);line-height:1;font-variant-numeric:tabular-nums;
        }
        .ov-price span{font-size:.9rem;color:var(--ink-3)}
        .ov-per{font-size:.86rem;color:var(--ink-2);margin:0 0 1.3rem}
        .ov-per em{font-style:normal;color:var(--accent);font-weight:700}
        .ov-plan ul{list-style:none;margin:0 0 1.6rem;padding:0;display:grid;gap:.55rem;flex:1}
        .ov-plan li{font-size:.9rem;color:var(--ink-2);display:flex;gap:.55rem;align-items:flex-start;line-height:1.6}
        .ov-plan li i{color:var(--accent);font-size:.78rem;margin-top:.42rem;flex:none}
        .ov-plan .ov-cta{width:100%;text-align:center}

        .ov-pay{
          margin-top:1.8rem;display:flex;gap:1rem;flex-wrap:wrap;align-items:center;
          font-size:.85rem;color:var(--ink-3);
        }
        .ov-pay b{color:var(--ink-2);font-weight:600}

        /* ── التصنيفات ──────────────────────────────────────── */
        .ov-cats{
          display:grid;gap:1rem;
          grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));
        }
        .ov-cat{
          background:var(--card);
          border:1px solid var(--line);border-radius:14px;
          padding:1.5rem 1.4rem;transition:all .3s ease;
        }
        .ov-cat:hover{transform:translateY(-6px);border-color:var(--line-hot);box-shadow:0 8px 24px rgba(0,0,0,0.5)}
        .ov-cat b{
          font-family:'Oxanium',sans-serif;color:var(--ink);
          font-size:1.05rem;display:block;margin-bottom:.5rem;
        }
        .ov-cat p{margin:0;font-size:.88rem;line-height:1.75;color:var(--ink-2)}

        /* ── جرّب بألوانك ───────────────────────────────────── */
        .ov-try{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:3rem;align-items:center}
        .ov-chips{display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:1.8rem}
        .ov-chip{
          display:inline-flex;align-items:center;gap:.5rem;
          padding:.55rem 1rem;border-radius:50px;cursor:pointer;
          background:rgba(84,22,181,0.14);border:1px solid var(--line);
          color:var(--ink-2);font-family:'Cairo',sans-serif;font-size:.88rem;
          transition:all .22s;
        }
        .ov-chip:hover{background:rgba(84,22,181,0.3);color:var(--ink)}
        .ov-chip[aria-pressed="true"]{border-color:var(--line-hot);background:rgba(84,22,181,0.34);color:var(--ink)}
        .ov-chip i{width:12px;height:12px;border-radius:50%;flex:none}

        /* ── التركيب ────────────────────────────────────────── */
        .ov-steps{counter-reset:s;display:grid;gap:1.2rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))}
        .ov-step{
          counter-increment:s;position:relative;
          background:var(--card);
          border:1px solid var(--line);border-radius:14px;
          padding:1.8rem 1.5rem 1.5rem;transition:all .3s ease;
        }
        .ov-step:hover{transform:translateY(-6px);border-color:var(--line-hot)}
        .ov-step::before{
          content:counter(s);
          font-family:'Oxanium',sans-serif;font-size:.85rem;font-weight:800;
          width:30px;height:30px;border-radius:50%;
          display:grid;place-items:center;margin-bottom:.9rem;
          color:#fff;background:linear-gradient(135deg,var(--grape),var(--violet));
        }
        .ov-step b{font-family:'Oxanium',sans-serif;color:var(--ink);font-size:1rem;display:block;margin-bottom:.45rem}
        .ov-step p{margin:0;font-size:.88rem;line-height:1.75;color:var(--ink-2)}

        /* ── الأسئلة ────────────────────────────────────────── */
        .ov-faq{display:grid;gap:.7rem;max-width:820px}
        .ov-qa{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden;transition:border-color .3s}
        .ov-qa.ov-open{border-color:var(--line-hot)}
        .ov-q{
          width:100%;text-align:right;cursor:pointer;
          background:none;border:0;padding:1.15rem 1.4rem;
          font-family:'Cairo',sans-serif;font-size:1rem;font-weight:600;color:var(--ink);
          display:flex;justify-content:space-between;align-items:center;gap:1rem;
        }
        .ov-q i{color:var(--accent);font-size:.8rem;transition:transform .3s;flex:none}
        .ov-qa.ov-open .ov-q i{transform:rotate(180deg)}
        .ov-a{padding:0 1.4rem 1.25rem;font-size:.92rem;line-height:1.95;color:var(--ink-2);margin:0}

        @media(max-width:980px){
          .ov-hero{grid-template-columns:1fr;gap:2.4rem;padding-top:3rem}
          .ov-try{grid-template-columns:1fr;gap:2.2rem}
          .ov section{padding:3.5rem 5%}
        }
        @media(prefers-reduced-motion:reduce){
          .ov *{animation:none!important;transition:none!important}
        }
      `}</style>

      {/* ── المقدمة ───────────────────────────────────────── */}
      <section className="ov-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="ov-banner"
          src="/photo/over-lay.webp"
          width={1916}
          height={821}
          alt="تركيبات Tilago على بث مباشر: لوحة ترتيب الداعمين وتنبيه هدية وإطار كاميرا"
          fetchPriority="high"
        />
        <div className="ov-copy">
          <h1>شاشتك بترد على جمهورك</h1>
          <p>
            تركيبات بث بتتحرك مع كل هدية ومتابع وتحدي. رابط واحد تحطه في OBS،
            بألوانك وشعارك، وتركيبات جديدة كل أسبوع.
          </p>
          <div className="ov-hero-btns">
            <Link href="#plans" className="ov-cta">ابدأ الاشتراك</Link>
            <Link href="#try" className="ov-cta ov-ghost">جرّب بألوانك</Link>
          </div>

          <div className="ov-hero-facts">
            <div className="ov-fact"><b>200</b><span>جنيه في الشهر مع الخطة السنوية</span></div>
            <div className="ov-fact"><b>60</b><span>ثانية والتركيبة على بثك</span></div>
            <div className="ov-fact"><b>0</b><span>برامج تنزّلها على جهازك</span></div>
          </div>
        </div>

      </section>

      {/* ── الأسعار ───────────────────────────────────────── */}
      <section id="plans">
        <div className="ov-in">
          <span className="ov-kicker">الاشتراك</span>
          <h2>اشتراك واحد، المكتبة كلها</h2>
          <p className="ov-lede">
            مفيش باقات ولا مميزات مقفولة. أي تركيبة في المكتبة دلوقتي وأي واحدة هتنزل بعد كده،
            اشتراكك بياخدها.
          </p>

          <div className="ov-plans">
            {PLANS.map(p => (
              <div key={p.key} className={`ov-plan${'best' in p && p.best ? ' ov-best' : ''}`}>
                {'best' in p && p.best && <span className="ov-plan-tag">الأوفر</span>}
                <h3>{p.name}</h3>
                <div className="ov-price">
                  <b>{p.price.toLocaleString('en-US')}</b>
                  <span>جنيه</span>
                </div>
                <p className="ov-per">
                  يطلع الشهر بـ <em>{p.per} جنيه</em>. {p.note}
                </p>
                <ul>
                  <li><i className="fas fa-check" />كل التركيبات في المكتبة</li>
                  <li><i className="fas fa-check" />الجديد أول ما ينزل</li>
                  <li><i className="fas fa-check" />ألوانك وشعارك على كل تركيبة</li>
                  <li><i className="fas fa-check" />تغيير اللون وانت لايف</li>
                  <li><i className="fas fa-check" />دعم لما تحتاجه</li>
                </ul>
                <Link href="/contact" className={`ov-cta${'best' in p && p.best ? '' : ' ov-ghost'}`}>
                  اشترك
                </Link>
              </div>
            ))}
          </div>

          <div className="ov-pay">
            <span><b>الدفع:</b> انستاباي وفودافون كاش وبايبال</span>
            <span>فيزا وميزا قريباً</span>
            <span><b>استرجاع كامل</b> خلال 7 أيام لو مركّبتش</span>
          </div>
        </div>
      </section>

      {/* ── التصنيفات ─────────────────────────────────────── */}
      <section>
        <div className="ov-in">
          <span className="ov-kicker">المكتبة</span>
          <h2>أربع أنواع تغطي بثك كله</h2>
          <p className="ov-lede">
            كل تركيبة بتشتغل لوحدها وبتتحدّث لحظياً من بثك. تختار اللي يناسب أسلوبك وتحطه.
          </p>
          <div className="ov-cats">
            {CATEGORIES.map(c => (
              <div className="ov-cat" key={c.key}>
                <b>{c.name}</b>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── جرّب بألوانك ──────────────────────────────────── */}
      <section id="try">
        <div className="ov-in ov-try">
          <div>
            <span className="ov-kicker">التخصيص</span>
            <h2>لونها زي ما تحب، دلوقتي</h2>
            <p className="ov-lede">
              دوس على أي لون وشوف التركيبة بتتغيّر جنبك في نفس اللحظة. نفس الحاجة بتحصل على بثك:
              تفتح حسابك من موبايلك وانت لايف، تغيّر اللون، والجمهور يشوف التغيير فوراً.
              الرابط في OBS مابيتغيّرش.
            </p>

            <div className="ov-chips" role="group" aria-label="اختيار لون التركيبة">
              {PALETTES.map(p => (
                <button
                  key={p.key}
                  type="button"
                  className="ov-chip"
                  aria-pressed={palette === p.key}
                  onClick={() => setPalette(p.key)}
                >
                  <i style={{ background: p.dot, color: p.dot }} aria-hidden="true" />
                  {p.name}
                </button>
              ))}
            </div>

            <Link href="#plans" className="ov-cta">ابدأ الاشتراك</Link>
          </div>

          <div className="ov-screen">
            <span className="ov-live"><i />{active.name}</span>
            <iframe
              ref={tryFrame}
              src={`${OVERLAY_SRC}?label=${encodeURIComponent('أكبر داعم')}&name=${encodeURIComponent('خالد المحترف')}&value=24310`}
              title="تجربة ألوان التركيبة"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ── التركيب ───────────────────────────────────────── */}
      <section>
        <div className="ov-in">
          <span className="ov-kicker">التركيب</span>
          <h2>تلات خطوات وانت بتبث</h2>
          <p className="ov-lede">
            مفيش تنصيب ولا تحذير من ويندوز ولا إعدادات. لو وقفت في أي خطوة، فيه زرار تجربة
            بيبعت حدث وهمي عشان تتأكد إنها شغّالة قبل ما تفتح البث.
          </p>
          <div className="ov-steps">
            <div className="ov-step">
              <b>انسخ الرابط</b>
              <p>من حسابك، كل تركيبة ليها رابط خاص بيك وبألوانك. ضغطة واحدة وهو في الحافظة.</p>
            </div>
            <div className="ov-step">
              <b>ضيف Browser Source</b>
              <p>في OBS اختار Sources ثم Browser، والزق الرابط، وحط المقاس 1920 في 1080.</p>
            </div>
            <div className="ov-step">
              <b>جرّبها قبل البث</b>
              <p>اضغط زرار التجربة من حسابك، وشوف التركيبة بترد على الشاشة. لو ردّت، انت جاهز.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── الأسئلة ───────────────────────────────────────── */}
      <section>
        <div className="ov-in">
          <span className="ov-kicker">أسئلة</span>
          <h2>اللي بيتسأل كتير</h2>
          <div className="ov-faq">
            {FAQ.map((f, i) => (
              <div className={`ov-qa${openFaq === i ? ' ov-open' : ''}`} key={f.q}>
                <button
                  type="button"
                  className="ov-q"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {f.q}
                  <i className="fas fa-chevron-down" aria-hidden="true" />
                </button>
                {openFaq === i && <p className="ov-a">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

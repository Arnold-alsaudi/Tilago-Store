import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Developer',
  description: 'مطوّر Tilago — صفحة المطوّر.',
};

export default function DeveloperPage() {
  return (
    <div className="dev" dir="rtl">
      <style>{`
        .dev {
          min-height: 100vh;
          background:
            radial-gradient(900px 500px at 80% -10%, rgba(84,22,181,0.18), transparent 60%),
            radial-gradient(700px 450px at 0% 100%, rgba(58,161,161,0.10), transparent 55%),
            linear-gradient(180deg,#0F083B,#0C0516);
          color: #d0cce8;
          font-family: 'Cairo','29LtBukra','Montserrat',sans-serif;
          display: flex; align-items: center; justify-content: center;
          padding: 6rem 6% 4rem;
        }
        .dev-inner { max-width: 760px; text-align: center; }
        .dev-badge {
          width: 74px; height: 74px; margin: 0 auto 1.6rem;
          border-radius: 22px; display: flex; align-items: center; justify-content: center;
          font-size: 2rem; color: #fff;
          background: linear-gradient(140deg,#7F3AA1,#5416B5);
          box-shadow: 0 16px 40px rgba(84,22,181,0.5), inset 0 1px 0 rgba(255,255,255,0.25);
        }
        .dev-sup {
          display: inline-flex; align-items: center; gap: 12px;
          font-family: 'Oxanium',sans-serif; font-weight: 800;
          font-size: .72rem; letter-spacing: 5px; text-transform: uppercase;
          color: rgba(196,160,224,0.75); margin-bottom: 14px;
        }
        .dev-sup::before, .dev-sup::after { content: ''; width: 30px; height: 1px; background: rgba(155,89,208,0.45); }
        .dev-title {
          font-family: 'Oxanium','29LtBukra',sans-serif; font-weight: 900;
          font-size: clamp(2rem,5vw,3.4rem); line-height: 1.1; margin: 0 0 1rem;
          background: linear-gradient(120deg,#fff,#c8a4f0 55%,#9B59D0);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        .dev-desc {
          color: rgba(180,168,215,0.6); font-size: clamp(.95rem,1.6vw,1.1rem);
          line-height: 1.9; max-width: 560px; margin: 0 auto 2.2rem;
        }
        .dev-note {
          display: inline-flex; align-items: center; gap: 10px;
          padding: .75rem 1.5rem; border-radius: 50px;
          background: rgba(84,22,181,0.1); border: 1px solid rgba(155,89,208,0.28);
          color: rgba(200,190,225,0.75); font-size: .88rem; font-weight: 600;
        }
        .dev-note i { color: #9B59D0; }
      `}</style>

      <div className="dev-inner">
        <div className="dev-badge"><i className="fas fa-code" /></div>
        <div className="dev-sup">TILAGO</div>
        <h1 className="dev-title">المطوّر</h1>
        <p className="dev-desc">
          صفحة المطوّر الخاصة بـ Tilago — المحتوى بيتجهّز حالياً وهيتضاف قريباً.
        </p>
        <div className="dev-note"><i className="fas fa-wrench" /> الصفحة قيد التجهيز</div>
      </div>
    </div>
  );
}

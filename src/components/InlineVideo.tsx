'use client';

import { useState } from 'react';

// فيديو مضمّن: يعرض بوستر (أو أول فريم) + زر تشغيل دائري من برّه،
// وبمجرد الضغط يشتغل الفيديو عادي بأدوات التحكم (تشغيل/إيقاف/صوت/ملء الشاشة).
export function InlineVideo({
  src,
  poster,
  style,
}: {
  src: string;
  poster?: string | null;
  style?: React.CSSProperties;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <video
        src={src}
        controls
        autoPlay
        playsInline
        style={{ width: '100%', display: 'block', background: '#000', maxHeight: '70vh', ...style }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label="تشغيل الفيديو"
      style={{
        position: 'relative', width: '100%', border: 'none', padding: 0,
        cursor: 'pointer', background: '#000', display: 'block', lineHeight: 0, ...style,
      }}
    >
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" style={{ width: '100%', display: 'block' }} />
      ) : (
        <video src={src} preload="metadata" muted playsInline
          style={{ width: '100%', display: 'block', pointerEvents: 'none' }} />
      )}
      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{
          width: 66, height: 66, borderRadius: '50%', background: 'rgba(255,255,255,0.94)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 26px rgba(0,0,0,0.45)',
        }}>
          <span style={{
            width: 0, height: 0, borderTop: '12px solid transparent', borderBottom: '12px solid transparent',
            borderLeft: '20px solid #141018', marginLeft: 5,
          }} />
        </span>
      </span>
    </button>
  );
}

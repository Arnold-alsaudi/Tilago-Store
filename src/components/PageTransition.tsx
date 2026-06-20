'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const wrapRef  = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);

  /* Page enter animation on every route change */
  useEffect(() => {
    setEntered(false);
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setEntered(true))
    );
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  /* Scroll reveal — fires both on scroll DOWN and UP */
  useEffect(() => {
    let obs: IntersectionObserver | null = null;

    const attach = () => {
      obs?.disconnect();
      const els = document.querySelectorAll<HTMLElement>('[data-reveal]');

      obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) {
            const step = Number(el.dataset.delay ?? 0);
            setTimeout(() => el.classList.add('sr-in'), step * 90);
          } else {
            /* remove class so it re-animates next time it scrolls into view */
            el.classList.remove('sr-in');
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -20px 0px' });

      els.forEach(el => obs!.observe(el));
    };

    const t = setTimeout(attach, 100);
    return () => { clearTimeout(t); obs?.disconnect(); };
  }, [pathname]);

  return (
    <>
      <style>{`
        /* ══ Page transition ══ */
        .pt-wrap {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity .55s cubic-bezier(.25,.8,.25,1),
                      transform .55s cubic-bezier(.25,.8,.25,1);
        }
        .pt-wrap.pt-in { opacity: 1; transform: none; }

        /* ══ Scroll reveal ══ */
        [data-reveal] {
          opacity: 0;
          transition: opacity .7s cubic-bezier(.25,.8,.25,1),
                      transform .7s cubic-bezier(.25,.8,.25,1),
                      filter .7s ease;
        }
        [data-reveal="up"]    { transform: translateY(55px); }
        [data-reveal="down"]  { transform: translateY(-55px); }
        [data-reveal="left"]  { transform: translateX(-65px); }
        [data-reveal="right"] { transform: translateX(65px); }
        [data-reveal="scale"] { transform: scale(.84) translateY(18px); filter: blur(2px); }
        [data-reveal="zoom"]  { transform: scale(.72); filter: blur(3px); }
        [data-reveal].sr-in   { opacity: 1; transform: none; filter: none; }

        [data-delay="1"] { transition-delay: .07s; }
        [data-delay="2"] { transition-delay: .15s; }
        [data-delay="3"] { transition-delay: .23s; }
        [data-delay="4"] { transition-delay: .31s; }
        [data-delay="5"] { transition-delay: .39s; }
        [data-delay="6"] { transition-delay: .47s; }

        /* ══ Scrollbar ══ */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #08021a; }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #5416B5, #7F3AA1);
          border-radius: 3px;
        }
        ::selection { background: rgba(127,58,161,.4); color: #f0ecff; }
      `}</style>

      <div ref={wrapRef} className={`pt-wrap${entered ? ' pt-in' : ''}`}>
        {children}
      </div>
    </>
  );
}

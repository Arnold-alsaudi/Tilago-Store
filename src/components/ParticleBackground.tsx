'use client';

import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ISourceOptions = any;

export function ParticleBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async engine => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const options: ISourceOptions = {
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    particles: {
      number: { value: 60, density: { enable: true, area: 800 } },
      color: { value: ['#5416B5', '#7F3AA1', '#F0830B', '#9B8FC0'] },
      shape: { type: 'circle' },
      opacity: { value: { min: 0.1, max: 0.5 }, animation: { enable: true, speed: 0.5, sync: false } },
      size: { value: { min: 1, max: 3 } },
      links: {
        enable: true,
        distance: 150,
        color: '#5416B5',
        opacity: 0.2,
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.8,
        direction: 'none',
        random: true,
        straight: false,
        outModes: { default: 'bounce' },
      },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: 'grab' },
        onClick: { enable: true, mode: 'push' },
      },
      modes: {
        grab: { distance: 140, links: { opacity: 0.4 } },
        push: { quantity: 2 },
      },
    },
    detectRetina: true,
  } as ISourceOptions;

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      options={options}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  );
}

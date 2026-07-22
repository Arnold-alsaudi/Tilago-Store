import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0C0516',
        'accent-deep': '#5416B5',
        'accent-violet': '#7F3AA1',
        highlight: '#F0830B',
        'text-primary': '#F0E6FF',
        'text-muted': '#9B8FC0',
      },
      fontFamily: {
        orbitron: ['Oxanium', 'sans-serif'],
        bukra:    ["'29LtBukra'", 'Cairo', 'sans-serif'],
        inter:    ['Montserrat', 'sans-serif'],
        cairo:    ['Cairo', "'29LtBukra'", 'sans-serif'],
        num:      ['Oxanium', 'Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #5416B5, #7F3AA1, #F0830B)',
        'gradient-text': 'linear-gradient(90deg, #7F3AA1, #5416B5, #F0830B)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'wave': 'wave 8s linear infinite',
        'rotate-y': 'rotateY 8s linear infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'slide-in': 'slideIn 0.5s ease-out',
        'fire': 'fire 1.5s ease-in-out infinite alternate',
        'parallax-slow': 'parallax 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(84,22,181,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(84,22,181,0.8), 0 0 60px rgba(240,131,11,0.3)' },
        },
        wave: {
          '0%': { transform: 'translateX(0) scaleY(1)' },
          '50%': { transform: 'translateX(-25%) scaleY(0.8)' },
          '100%': { transform: 'translateX(-50%) scaleY(1)' },
        },
        rotateY: {
          '0%': { transform: 'perspective(800px) rotateY(0deg) rotateX(10deg)' },
          '100%': { transform: 'perspective(800px) rotateY(360deg) rotateX(10deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fire: {
          '0%': { transform: 'scaleY(1) translateY(0)', opacity: '0.8' },
          '100%': { transform: 'scaleY(1.1) translateY(-5px)', opacity: '1' },
        },
        parallax: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;

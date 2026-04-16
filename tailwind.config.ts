import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#04060D',
          900: '#080B14',
          800: '#0D1120',
          700: '#111827',
          600: '#1A2235',
          500: '#1E2A3E',
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.04)',
          hover: 'rgba(255,255,255,0.07)',
          border: 'rgba(255,255,255,0.08)',
          strong: 'rgba(255,255,255,0.12)',
        },
        cyan: {
          DEFAULT: '#00D4FF',
          50: 'rgba(0,212,255,0.05)',
          100: 'rgba(0,212,255,0.10)',
          200: 'rgba(0,212,255,0.20)',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#00D4FF',
          600: '#0891B2',
          glow: 'rgba(0,212,255,0.35)',
        },
        violet: {
          DEFAULT: '#7C3AED',
          50: 'rgba(124,58,237,0.05)',
          100: 'rgba(124,58,237,0.10)',
          200: 'rgba(124,58,237,0.20)',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          glow: 'rgba(124,58,237,0.35)',
        },
        neon: {
          green: '#00FF87',
          amber: '#FFB800',
          red: '#FF3D6A',
          blue: '#4D9EFF',
        },
        ink: {
          DEFAULT: '#E2E8F0',
          muted: '#94A3B8',
          faint: '#475569',
          ghost: '#2A3447',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-grid': `linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)`,
        'glow-cyan': 'radial-gradient(ellipse at center, rgba(0,212,255,0.15) 0%, transparent 70%)',
        'glow-violet': 'radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0,212,255,0.25), 0 0 60px rgba(0,212,255,0.1)',
        'glow-violet': '0 0 20px rgba(124,58,237,0.25), 0 0 60px rgba(124,58,237,0.1)',
        'glow-sm': '0 0 12px rgba(0,212,255,0.2)',
        'card': '0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 0 0 1px rgba(0,212,255,0.2), 0 8px 32px rgba(0,0,0,0.5), 0 0 24px rgba(0,212,255,0.08)',
        'modal': '0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.6)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'scan-line': 'scanLine 3s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0,212,255,0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(0,212,255,0.8), 0 0 40px rgba(0,212,255,0.3)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
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

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
        background: '#0f172a',
        primary: '#94a3b8',
        secondary: '#22c55e',
        accent: '#ef4444',
        'text-primary': '#f8fafc',
        'text-secondary': '#cbd5e1',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(148, 163, 184, 0.1)',
        'glow-green': '0 0 15px rgba(34, 197, 94, 0.2)',
      },
      animation: {
        'pulse': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide': 'slide 8s linear infinite',
        'slide-reverse': 'slide-reverse 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '25%': { transform: 'translateY(-20px) translateX(10px)' },
          '50%': { transform: 'translateY(0) translateX(20px)' },
          '75%': { transform: 'translateY(20px) translateX(10px)' },
        },
        slide: {
          '0%': { transform: 'translateX(-100%) rotate(-45deg)' },
          '100%': { transform: 'translateX(100%) rotate(-45deg)' },
        },
        'slide-reverse': {
          '0%': { transform: 'translateX(100%) rotate(45deg)' },
          '100%': { transform: 'translateX(-100%) rotate(45deg)' },
        },
      },
    },
  },
  plugins: [],
};

export default config; 
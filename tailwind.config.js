/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#10B981',
        accent: '#F59E0B',
        background: '#111827',
        surface: '#1F2937',
        text: '#F9FAFB',
        'text-secondary': '#9CA3AF',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 
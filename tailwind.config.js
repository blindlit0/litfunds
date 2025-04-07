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
        primary: {
          DEFAULT: '#00F5FF', // Bright cyan
          dark: '#00B4CC',
        },
        secondary: {
          DEFAULT: '#00FF9D', // Bright green
          dark: '#00CC7D',
        },
        accent: '#FF00FF', // Magenta for highlights
        background: '#0A0A1A', // Dark navy
        surface: {
          DEFAULT: '#1A1A2E', // Darker navy
          light: '#2A2A3E',
        },
        text: '#FFFFFF',
        'text-secondary': '#B8B8D8',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(0, 245, 255, 0.5)',
        'glow-green': '0 0 15px rgba(0, 255, 157, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 
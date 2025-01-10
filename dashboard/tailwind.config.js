/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'matrix-scan 2s linear infinite',
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
        corporate: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


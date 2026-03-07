/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base:     '#080b0f',
        surface:  '#0d1117',
        elevated: '#111820',
        hover:    '#161e28',
        border:   '#1e2d3d',
        'border-bright': '#2a3f55',
        cyan:     '#00d4ff',
        'cyan-dim': '#0099bb',
        danger:   '#ff4455',
        warning:  '#ffaa00',
        success:  '#00cc88',
        primary:  '#e8edf2',
        secondary:'#7a8fa6',
        muted:    '#4a5f72',
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      width:  { sidebar: '260px' },
      height: { header: '60px' },
    },
  },
  plugins: [],
}
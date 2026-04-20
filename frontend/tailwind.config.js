/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#05070A',
          900: '#0A0C10',
          800: '#0D1117',
          700: '#111620',
          600: '#131920',
          500: '#1C2128',
          400: '#253040',
        },
        brand: {
          50:  'rgba(61,184,122,0.08)',
          400: '#7DDBA8',
          500: '#3DB87A',
          600: '#24905F',
          700: '#1A6B47',
          800: '#1E4A34',
        },
        gold: {
          50:  'rgba(200,147,42,0.08)',
          400: '#F7DD9A',
          500: '#E6B04A',
          600: '#C8932A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0,0,0,0.35)',
        'glow-brand': '0 0 20px rgba(61,184,122,0.15)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #1E4A34, #24905F)',
        'gold-gradient':  'linear-gradient(135deg, #C8932A, #E6B04A)',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#020617',
        card: '#0f172a',
        border: '#1e293b',
        accent: '#6366f1',
      },
      backgroundImage: {
        'hero-gradient':
          'radial-gradient(circle at top left, rgba(99,102,241,0.28), transparent 34%), radial-gradient(circle at top right, rgba(124,58,237,0.24), transparent 26%), linear-gradient(135deg, #0f172a 0%, #312e81 48%, #6d28d9 100%)',
      },
      boxShadow: {
        glow: '0 20px 60px rgba(79, 70, 229, 0.25)',
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2.6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 0.85 },
          '50%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};

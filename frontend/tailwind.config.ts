import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#EEF0E7',
        ink: '#14171A',
        pine: {
          50: '#EAF0EC',
          100: '#CBDACF',
          300: '#4F7A5F',
          500: '#1F4A3A',
          600: '#193C2F',
          700: '#122B22',
          900: '#0B1A15',
        },
        copper: {
          100: '#F3DFC8',
          300: '#DDA25F',
          400: '#D08F45',
          500: '#C1602B',
          600: '#A34F22',
        },
        line: '#D8DED5',
        surface: '#FFFFFF',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '3px',
        DEFAULT: '4px',
        md: '6px',
        lg: '10px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(11, 26, 21, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;

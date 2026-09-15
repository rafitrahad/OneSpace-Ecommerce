import type { Config } from 'tailwindcss';

// Every color below reads from a CSS variable (defined in app/globals.css
// for :root and .dark) instead of a fixed hex value. That means every
// component that already uses e.g. `bg-paper` or `text-pine-700/60`
// automatically re-themes for dark mode - no per-component edits needed.
// The `<alpha-value>` placeholder is filled in by Tailwind so opacity
// modifiers like `/60` keep working.
function withOpacity(variable: string) {
  return `rgb(var(${variable}) / <alpha-value>)`;
}

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: withOpacity('--color-paper'),
        ink: withOpacity('--color-ink'),
        pine: {
          50: withOpacity('--color-pine-50'),
          100: withOpacity('--color-pine-100'),
          300: withOpacity('--color-pine-300'),
          500: withOpacity('--color-pine-500'),
          600: withOpacity('--color-pine-600'),
          700: withOpacity('--color-pine-700'),
          900: withOpacity('--color-pine-900'),
        },
        copper: {
          100: withOpacity('--color-copper-100'),
          300: withOpacity('--color-copper-300'),
          400: withOpacity('--color-copper-400'),
          500: withOpacity('--color-copper-500'),
          600: withOpacity('--color-copper-600'),
        },
        line: withOpacity('--color-line'),
        surface: withOpacity('--color-surface'),
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
        card: '0 1px 2px rgb(var(--color-ink) / 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;

import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/controllers/auth.controller';
import { ThemeProvider } from '@/controllers/theme.controller';
import { Navbar } from '@/components/Navbar';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OneSpace — Shop',
  description: 'Role-based shop management platform for admins, managers, and customers.',
};

// Runs before React hydrates, so the correct theme is painted immediately
// instead of flashing light-then-dark (or vice versa) on every page load.
// Priority: last-known cached theme > OS preference. The logged-in user's
// saved DB preference is reconciled a moment later by ThemeProvider once
// /auth/me resolves.
const themeInitScript = `
(function () {
  try {
    var cached = localStorage.getItem('onespace_theme_cache');
    var theme = cached === 'dark' || cached === 'light'
      ? cached
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans">
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

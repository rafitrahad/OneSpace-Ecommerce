'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from '@/lib/api';
import { ThemePreference } from '@/models/types';
import { useAuth } from './auth.controller';

const CACHE_KEY = 'onespace_theme_cache'; // last-resolved light/dark, for instant paint on reload

type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: ResolvedTheme; // what's actually applied right now
  preference: ThemePreference; // the user's stored choice ('system' for guests)
  setPreference: (pref: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  window.localStorage.setItem(CACHE_KEY, theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [theme, setTheme] = useState<ResolvedTheme>('light');

  // Resolve + apply whenever the preference or system setting could change.
  const resolve = useCallback((pref: ThemePreference) => {
    const resolved: ResolvedTheme = pref === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : pref;
    setTheme(resolved);
    applyTheme(resolved);
  }, []);

  // Initial paint: match whatever the blocking inline script (see layout.tsx)
  // already applied, so there's no flash.
  useEffect(() => {
    const cached = window.localStorage.getItem(CACHE_KEY) as ResolvedTheme | null;
    setTheme(cached === 'dark' ? 'dark' : 'light');
  }, []);

  // Once we know the logged-in user's saved preference, reconcile to it.
  // Guests (user === null) stay on 'system' and just follow the OS setting.
  useEffect(() => {
    const pref = user?.themePreference ?? 'system';
    setPreferenceState(pref);
    resolve(pref);
  }, [user, resolve]);

  // Live-update if the OS theme changes while "system" is active.
  useEffect(() => {
    if (preference !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => resolve('system');
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [preference, resolve]);

  const setPreference = useCallback(
    async (pref: ThemePreference) => {
      setPreferenceState(pref);
      resolve(pref);
      // Guests have nowhere to save this - the toggle only appears in
      // Profile, which requires being logged in, so this always fires
      // for an authenticated user in practice.
      if (user) {
        await api.patch('/users/me/theme', { themePreference: pref });
      }
    },
    [resolve, user],
  );

  const value = useMemo(
    () => ({ theme, preference, setPreference }),
    [theme, preference, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { User, Role } from '@/models/types';
import { LoginInput, RegisterInput } from '@/models/schemas';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'shopmvc_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<User>('/auth/me');
      setUser(data);
    } catch {
      window.localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const { data } = await api.post('/auth/login', input);
    window.localStorage.setItem(TOKEN_KEY, data.accessToken);
    setUser(data.user);
    return data.user as User;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const { data } = await api.post('/auth/register', input);
    window.localStorage.setItem(TOKEN_KEY, data.accessToken);
    setUser(data.user);
    return data.user as User;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    router.push('/login');
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function hasRole(user: User | null, roles: Role[]) {
  return !!user && roles.includes(user.role);
}

export async function requestPasswordReset(input: { email: string }) {
  const { data } = await api.post('/auth/forgot-password', input);
  return data as { message: string };
}

export async function resetPassword(token: string, newPassword: string) {
  const { data } = await api.post('/auth/reset-password', { token, newPassword });
  return data as { message: string };
}
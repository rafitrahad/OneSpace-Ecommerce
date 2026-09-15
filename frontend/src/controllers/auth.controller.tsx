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
import { LoginInput, RegisterInput, ForgotPasswordInput } from '@/models/schemas';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  loginWithToken: (token: string) => Promise<User>;
  logout: () => void;
  logoutAllDevices: () => Promise<void>;
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

  // Used by the OAuth callback page: the backend already issued a token
  // after Google sign-in, this just stores it and loads the user.
  const loginWithToken = useCallback(async (token: string) => {
    window.localStorage.setItem(TOKEN_KEY, token);
    const { data } = await api.get<User>('/auth/me');
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    router.push('/login');
  }, [router]);

  const logoutAllDevices = useCallback(async () => {
    await api.post('/auth/logout-all');
    window.localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    router.push('/login');
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, register, loginWithToken, logout, logoutAllDevices, refreshUser }),
    [user, loading, login, register, loginWithToken, logout, logoutAllDevices, refreshUser],
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

// Builds the URL that kicks off Google sign-in - just link/redirect to this.
export function googleLoginUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  return `${apiUrl}/auth/google`;
}

export async function requestPasswordReset(input: ForgotPasswordInput) {
  const { data } = await api.post<{ message: string }>('/auth/forgot-password', input);
  return data;
}

export async function resetPassword(token: string, newPassword: string) {
  const { data } = await api.post<{ message: string }>('/auth/reset-password', {
    token,
    newPassword,
  });
  return data;
}

export async function verifyEmail(token: string) {
  const { data } = await api.get<{ message: string }>('/auth/verify-email', {
    params: { token },
  });
  return data;
}

export async function resendVerification() {
  const { data } = await api.post<{ message: string }>('/auth/resend-verification');
  return data;
}

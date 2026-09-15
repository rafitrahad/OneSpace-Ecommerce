'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/controllers/auth.controller';

export function OAuthCallbackView() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Missing sign-in token from Google.');
      return;
    }
    loginWithToken(token)
      .then((user) => {
        router.replace(user.role === 'customer' ? '/' : '/dashboard');
      })
      .catch(() => setError('Could not complete Google sign-in.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-6 py-16 text-center">
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <p className="text-sm text-pine-700/60">Signing you in…</p>
      )}
    </div>
  );
}

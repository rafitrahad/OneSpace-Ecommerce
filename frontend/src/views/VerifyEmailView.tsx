'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyEmail } from '@/controllers/auth.controller';
import { apiErrorMessage } from '@/lib/api';

export function VerifyEmailView() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }
    verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(apiErrorMessage(err));
      });
  }, [token]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-6 py-16 text-center">
      {status === 'loading' && <p className="text-sm text-pine-700/60">Verifying your email…</p>}
      {status === 'success' && (
        <>
          <h1 className="font-display text-2xl text-ink">Email verified</h1>
          <p className="mt-2 text-sm text-pine-700/70">{message}</p>
        </>
      )}
      {status === 'error' && (
        <>
          <h1 className="font-display text-2xl text-ink">Verification failed</h1>
          <p className="mt-2 text-sm text-red-600">{message}</p>
        </>
      )}
      <Link href="/" className="mt-6 text-sm text-pine-500 underline">
        Back to shop
      </Link>
    </div>
  );
}

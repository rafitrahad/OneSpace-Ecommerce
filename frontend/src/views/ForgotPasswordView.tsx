'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/models/schemas';
import { requestPasswordReset } from '@/controllers/auth.controller';
import { apiErrorMessage } from '@/lib/api';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

export function ForgotPasswordView() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordInput) {
    setServerError('');
    try {
      await requestPasswordReset(values);
      setSent(true);
    } catch (err) {
      setServerError(apiErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Reset your password</h1>
      <p className="mt-1 text-sm text-pine-700/60">
        Enter your account email and we&apos;ll send a link to reset your password.
      </p>

      {sent ? (
        <div className="mt-8 rounded-md border border-line bg-surface p-4">
          <p className="text-sm text-ink">
            If an account exists for that email, a reset link is on its way. Check your inbox
            (and spam folder) for a message titled &quot;Reset your password&quot;.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}

      <p className="mt-6 text-sm text-pine-700/70">
        <Link href="/login" className="text-pine-500 underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}

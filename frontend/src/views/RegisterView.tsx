'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { registerSchema, RegisterInput } from '@/models/schemas';
import { useAuth, googleLoginUrl } from '@/controllers/auth.controller';
import { apiErrorMessage } from '@/lib/api';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

export function RegisterView() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    setServerError('');
    try {
      await registerUser(values);
      router.push('/');
    } catch (err) {
      setServerError(apiErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Create your account</h1>
      <p className="mt-1 text-sm text-pine-700/60">Shop faster and track your orders.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
        <Input label="Full name" {...register('name')} error={errors.name?.message} />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />
        <Input label="Phone (optional)" {...register('phone')} />
        <Input label="Address (optional)" {...register('address')} />
        {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <div className="mt-4 flex items-center gap-3 text-xs text-pine-700/50">
        <div className="h-px flex-1 bg-line" />
        or
        <div className="h-px flex-1 bg-line" />
      </div>
      <a
        href={googleLoginUrl()}
        className="mt-4 flex items-center justify-center gap-2 rounded-pill border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-pine-50"
      >
        Continue with Google
      </a>

      <p className="mt-6 text-sm text-pine-700/70">
        Already have an account?{' '}
        <Link href="/login" className="text-pine-500 underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { loginSchema, LoginInput } from '@/models/schemas';
import { useAuth } from '@/controllers/auth.controller';
import { apiErrorMessage } from '@/lib/api';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

export function LoginView() {
  const { login } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setServerError('');
    try {
      const user = await login(values);
      router.push(user.role === 'customer' ? '/' : '/dashboard');
    } catch (err) {
      setServerError(apiErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-pine-700/60">Log in to your account to continue.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />
        
        {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
      <Link href="/forgot-password" className="text-sm text-pine-500 underline">
          Forgot your password?
        </Link>
      <p className="mt-6 text-sm text-pine-700/70">
        New here?{' '}
        <Link href="/register" className="text-pine-500 underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

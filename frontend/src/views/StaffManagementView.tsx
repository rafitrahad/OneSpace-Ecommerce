'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStaff } from '@/controllers/users.controller';
import { staffSchema, StaffInput } from '@/models/schemas';
import { apiErrorMessage } from '@/lib/api';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { RoleGuard } from '@/components/RoleGuard';

function StaffInner() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StaffInput>({ resolver: zodResolver(staffSchema) });

  async function onSubmit(values: StaffInput) {
    setMessage('');
    setError('');
    try {
      await createStaff(values);
      setMessage(`${values.role === 'admin' ? 'Admin' : 'Manager'} account created for ${values.email}.`);
      reset({ name: '', email: '', password: '', role: 'manager' });
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Staff roles</h1>
      <p className="mt-1 text-sm text-pine-700/60">
        Create new admin or shop manager accounts. To change an existing user&apos;s role, use
        Customers &amp; staff.
      </p>

      <Card className="mt-6 max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Full name" {...register('name')} error={errors.name?.message} />
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input
            label="Temporary password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
          />
          <Select label="Role" {...register('role')}>
            <option value="manager">Shop manager</option>
            <option value="admin">Admin</option>
          </Select>
          {message && <p className="text-sm text-pine-700">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create staff account'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export function StaffManagementView() {
  return (
    <RoleGuard roles={['admin']}>
      <StaffInner />
    </RoleGuard>
  );
}

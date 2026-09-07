'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileInput, changePasswordSchema, ChangePasswordInput } from '@/models/schemas';
import { myProfile, updateMyProfile, changeMyPassword } from '@/controllers/users.controller';
import { apiErrorMessage } from '@/lib/api';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { RoleGuard } from '@/components/RoleGuard';

function ProfileInner() {
  const [message, setMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    myProfile().then((p) =>
      reset({ name: p.name, phone: p.phone || '', address: p.address || '' }),
    );
  }, [reset]);

  async function onSubmit(values: ProfileInput) {
    setMessage('');
    setServerError('');
    try {
      await updateMyProfile(values);
      setMessage('Profile updated.');
    } catch (err) {
      setServerError(apiErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <h1 className="font-display text-3xl text-ink">Your profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
        <Input label="Full name" {...register('name')} error={errors.name?.message} />
        <Input label="Phone" {...register('phone')} />
        <Input label="Address" {...register('address')} />
        {message && <p className="text-sm text-pine-700">{message}</p>}
        {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
      </form>

      <div className="mt-6 border-t border-line pt-6">
        <Button variant="ghost" onClick={() => setPasswordModalOpen(true)}>
          Change password
        </Button>
      </div>

      <ChangePasswordModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </div>
  );
}

function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  function handleClose() {
    reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setServerError('');
    onClose();
  }

  async function onSubmit(values: ChangePasswordInput) {
    setServerError('');
    try {
      await changeMyPassword(values.currentPassword, values.newPassword);
      // Password updated successfully - close the modal automatically.
      handleClose();
    } catch (err) {
      setServerError(apiErrorMessage(err));
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Change password">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Current password"
          type="password"
          {...register('currentPassword')}
          error={errors.currentPassword?.message}
        />
        <Input
          label="New password"
          type="password"
          {...register('newPassword')}
          error={errors.newPassword?.message}
        />
        <Input
          label="Confirm new password"
          type="password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
        {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </Modal>
  );
}

export function ProfileView() {
  return (
    <RoleGuard roles={['admin', 'manager', 'customer']}>
      <ProfileInner />
    </RoleGuard>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileInput, changePasswordSchema, ChangePasswordInput } from '@/models/schemas';
import { myProfile, updateMyProfile, changeMyPassword } from '@/controllers/users.controller';
import { useAuth, resendVerification } from '@/controllers/auth.controller';
import { useTheme } from '@/controllers/theme.controller';
import { apiErrorMessage } from '@/lib/api';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { RoleGuard } from '@/components/RoleGuard';
import { ThemePreference } from '@/models/types';

function ProfileInner() {
  const { user, logoutAllDevices } = useAuth();
  const [message, setMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');

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

  async function handleResendVerification() {
    setVerifyMessage('');
    try {
      const res = await resendVerification();
      setVerifyMessage(res.message);
    } catch (err) {
      setVerifyMessage(apiErrorMessage(err));
    }
  }

  async function handleLogoutEverywhere() {
    if (!confirm('This will sign you out on every device. Continue?')) return;
    await logoutAllDevices();
  }

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <h1 className="font-display text-3xl text-ink">Your profile</h1>

      {user && !user.isEmailVerified && (
        <div className="mt-4 rounded-md border border-copper-300 bg-copper-100 p-3 text-sm text-copper-600">
          <p>Your email isn&apos;t verified yet.</p>
          <button onClick={handleResendVerification} className="mt-1 underline">
            Resend verification email
          </button>
          {verifyMessage && <p className="mt-1 text-xs">{verifyMessage}</p>}
        </div>
      )}

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

      <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-6">
        <Button variant="ghost" onClick={() => setPasswordModalOpen(true)}>
          Change password
        </Button>
        <Button variant="danger" onClick={handleLogoutEverywhere}>
          Log out of all devices
        </Button>
      </div>

      <AppearanceSection />

      <ChangePasswordModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </div>
  );
}

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
  {
    value: 'light',
    label: 'Light',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
  },
  {
    value: 'system',
    label: 'System',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
];

function AppearanceSection() {
  const { preference, setPreference } = useTheme();
  const [saving, setSaving] = useState(false);

  async function handleSelect(value: ThemePreference) {
    setSaving(true);
    try {
      await setPreference(value);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 border-t border-line pt-6">
      <p className="text-sm font-medium text-ink">Appearance</p>
      <p className="mt-1 text-xs text-pine-700/60">
        Choose how OneSpace looks. This is saved to your account and follows you to any device.
      </p>
      <div className="mt-3 inline-flex rounded-pill border border-line bg-surface p-1">
        {THEME_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={saving}
            onClick={() => handleSelect(opt.value)}
            className={`flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-medium transition-colors ${
              preference === opt.value
                ? 'bg-pine-500 text-white'
                : 'text-pine-700/70 hover:bg-pine-50'
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>
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

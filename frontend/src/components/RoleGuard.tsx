'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/controllers/auth.controller';
import { Role } from '@/models/types';

export function RoleGuard({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!roles.includes(user.role)) {
      router.replace('/');
    }
  }, [user, loading, roles, router]);

  if (loading || !user || !roles.includes(user.role)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-pine-700/60">
        Checking access…
      </div>
    );
  }

  return <>{children}</>;
}

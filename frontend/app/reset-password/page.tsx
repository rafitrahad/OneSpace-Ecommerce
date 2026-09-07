import { Suspense } from 'react';
import { ResetPasswordView } from '@/views/ResetPasswordView';

export default function Page() {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-sm text-pine-700/60">Loading…</p>}>
      <ResetPasswordView />
    </Suspense>
  );
}
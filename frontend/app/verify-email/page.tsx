import { Suspense } from 'react';
import { VerifyEmailView } from '@/views/VerifyEmailView';

export default function Page() {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-sm text-pine-700/60">Loading…</p>}>
      <VerifyEmailView />
    </Suspense>
  );
}

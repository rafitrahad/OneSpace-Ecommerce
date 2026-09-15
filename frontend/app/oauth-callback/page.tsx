import { Suspense } from 'react';
import { OAuthCallbackView } from '@/views/OAuthCallbackView';

export default function Page() {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-sm text-pine-700/60">Loading…</p>}>
      <OAuthCallbackView />
    </Suspense>
  );
}

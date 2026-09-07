import { Suspense } from 'react';
import { HomeView } from '@/views/HomeView';

export default function Page() {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-sm text-pine-700/60">Loading…</p>}>
      <HomeView />
    </Suspense>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-md border border-dashed border-line p-10 text-center">
      <p className="font-display text-lg text-ink">{title}</p>
      {hint && <p className="mt-1 text-sm text-pine-700/60">{hint}</p>}
    </div>
  );
}

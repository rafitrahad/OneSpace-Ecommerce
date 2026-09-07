export function Card({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-md border border-line bg-surface p-5 shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function StatTile({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <Card>
      <p className="text-sm text-pine-700/70">{label}</p>
      <p className="mt-1 font-display text-3xl text-ink">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-pine-700/60">{sublabel}</p>}
    </Card>
  );
}

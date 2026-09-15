'use client';

export function StarDisplay({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1 text-sm">
      <span className="text-copper-500">
        {'★'.repeat(Math.round(rating))}
        <span className="text-line">{'★'.repeat(5 - Math.round(rating))}</span>
      </span>
      <span className="text-pine-700/60">
        {rating > 0 ? rating.toFixed(1) : 'No ratings yet'}
        {typeof count === 'number' && count > 0 ? ` (${count})` : ''}
      </span>
    </div>
  );
}

export function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex gap-1 text-2xl">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={star <= value ? 'text-copper-500' : 'text-line'}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

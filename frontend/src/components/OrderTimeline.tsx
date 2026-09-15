import { OrderStatus } from '@/models/types';

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'pending', label: 'Placed' },
  { status: 'processing', label: 'Processing' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'delivered', label: 'Delivered' },
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        This order was cancelled
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const reached = i <= currentIndex;
        return (
          <div key={step.status} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  reached ? 'bg-pine-500 text-white' : 'bg-line text-pine-700/40'
                }`}
              >
                {reached ? '✓' : i + 1}
              </span>
              <span
                className={`whitespace-nowrap text-xs ${reached ? 'text-ink' : 'text-pine-700/40'}`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 ${i < currentIndex ? 'bg-pine-500' : 'bg-line'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

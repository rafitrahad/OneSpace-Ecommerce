import { OrderStatus } from '@/models/types';

const styles: Record<OrderStatus, string> = {
  pending: 'bg-copper-100 text-copper-600',
  processing: 'bg-pine-50 text-pine-500 border border-pine-100',
  shipped: 'bg-pine-100 text-pine-700',
  delivered: 'bg-pine-500 text-white',
  cancelled: 'bg-red-50 text-red-600',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block rounded-pill px-3 py-1 text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

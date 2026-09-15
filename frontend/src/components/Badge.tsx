import { OrderStatus, PaymentStatus } from '@/models/types';

const orderStyles: Record<OrderStatus, string> = {
  pending: 'bg-copper-100 text-copper-600',
  processing: 'bg-pine-50 text-pine-500 border border-pine-100',
  shipped: 'bg-pine-100 text-pine-700',
  delivered: 'bg-pine-500 text-white',
  cancelled: 'bg-red-50 text-red-600',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block rounded-pill px-3 py-1 text-xs font-medium capitalize ${orderStyles[status]}`}>
      {status}
    </span>
  );
}

const paymentStyles: Record<PaymentStatus, string> = {
  pending: 'bg-copper-100 text-copper-600',
  paid: 'bg-pine-500 text-white',
  failed: 'bg-red-50 text-red-600',
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`inline-block rounded-pill px-3 py-1 text-xs font-medium capitalize ${paymentStyles[status]}`}>
      {status}
    </span>
  );
}

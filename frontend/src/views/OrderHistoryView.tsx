'use client';

import { useEffect, useState } from 'react';
import { myOrders, cancelOrder } from '@/controllers/orders.controller';
import { Order } from '@/models/types';
import { formatCurrency, formatDate } from '@/lib/format';
import { PaymentStatusBadge } from '@/components/Badge';
import { OrderTimeline } from '@/components/OrderTimeline';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { RoleGuard } from '@/components/RoleGuard';
import { apiErrorMessage } from '@/lib/api';

function OrderHistoryInner() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  function load() {
    setLoading(true);
    myOrders().then(setOrders).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCancel(id: string) {
    setMessage('');
    try {
      await cancelOrder(id);
      load();
    } catch (err) {
      setMessage(apiErrorMessage(err));
    }
  }

  if (loading) return <p className="mx-auto max-w-4xl px-6 py-16 text-sm text-pine-700/60">Loading orders…</p>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-3xl text-ink">My orders</h1>
      {message && <p className="mt-3 text-sm text-red-600">{message}</p>}

      {orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No orders yet" hint="Your placed orders will show up here." />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-md border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-ink">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-pine-700/60">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase text-pine-700/50">
                    {order.paymentMethod === 'cod' ? 'Cash on delivery' : order.paymentMethod}
                  </span>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </div>

              <div className="mt-4">
                <OrderTimeline status={order.status} />
              </div>

              <ul className="mt-4 flex flex-col gap-1 text-sm text-pine-700/80">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity} × {item.product.name}
                    {item.variant ? ` (${item.variant})` : ''} —{' '}
                    {formatCurrency(Number(item.price) * item.quantity)}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-pine-700/70">
                  {Number(order.discountAmount) > 0 && (
                    <p>
                      Subtotal {formatCurrency(order.subtotal)} · Discount −
                      {formatCurrency(order.discountAmount)}
                      {order.couponCode ? ` (${order.couponCode})` : ''}
                    </p>
                  )}
                  <p className="font-medium text-ink">Total: {formatCurrency(order.total)}</p>
                </div>
                {(order.status === 'pending' || order.status === 'processing') && (
                  <Button variant="danger" onClick={() => handleCancel(order.id)}>
                    Cancel order
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrderHistoryView() {
  return (
    <RoleGuard roles={['customer']}>
      <OrderHistoryInner />
    </RoleGuard>
  );
}

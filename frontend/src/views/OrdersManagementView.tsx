'use client';

import { useEffect, useState } from 'react';
import { allOrders, updateOrderStatus, cancelOrder } from '@/controllers/orders.controller';
import { Order, OrderStatus } from '@/models/types';
import { formatCurrency, formatDate } from '@/lib/format';
import { OrderStatusBadge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { RoleGuard } from '@/components/RoleGuard';
import { apiErrorMessage } from '@/lib/api';

const STATUS_FLOW: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

function OrdersInner() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');

  function load() {
    allOrders().then(setOrders);
  }

  useEffect(load, []);

  async function handleStatusChange(id: string, status: OrderStatus) {
    setError('');
    try {
      if (status === 'cancelled') {
        await cancelOrder(id);
      } else {
        await updateOrderStatus(id, status);
      }
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Orders</h1>
      <p className="mt-1 text-sm text-pine-700/60">Process orders and update fulfillment status.</p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No orders yet" />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-md border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-pine-700/60">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 text-ink">#{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-pine-700/70">{order.user?.name || '—'}</td>
                  <td className="px-4 py-3 text-pine-700/70">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-ink">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="rounded border border-line px-2 py-1 text-sm"
                    >
                      {STATUS_FLOW.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function OrdersManagementView() {
  return (
    <RoleGuard roles={['admin', 'manager']}>
      <OrdersInner />
    </RoleGuard>
  );
}

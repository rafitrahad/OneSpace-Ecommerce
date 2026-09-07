'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCart, updateCartItem, removeCartItem } from '@/controllers/cart.controller';
import { CartItem } from '@/models/types';
import { formatCurrency } from '@/lib/format';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { RoleGuard } from '@/components/RoleGuard';

function CartInner() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    getCart().then(setItems).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function changeQuantity(id: string, quantity: number) {
    if (quantity < 1) return;
    await updateCartItem(id, quantity);
    load();
  }

  async function remove(id: string) {
    await removeCartItem(id);
    load();
  }

  const total = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  if (loading) return <p className="mx-auto max-w-3xl px-6 py-16 text-sm text-pine-700/60">Loading cart…</p>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl text-ink">Your cart</h1>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="Your cart is empty" hint="Browse the catalog and add something you like." />
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-col divide-y divide-line rounded-md border border-line bg-surface">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="font-medium text-ink">{item.product.name}</p>
                  <p className="text-sm text-pine-700/60">{formatCurrency(item.product.price)} each</p>
                </div>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => changeQuantity(item.id, Number(e.target.value))}
                  className="w-16 rounded border border-line px-2 py-1 text-sm"
                />
                <p className="w-24 text-right font-medium text-ink">
                  {formatCurrency(Number(item.product.price) * item.quantity)}
                </p>
                <button
                  onClick={() => remove(item.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="font-display text-2xl text-ink">Total: {formatCurrency(total)}</p>
            <Link href="/checkout">
              <Button>Proceed to checkout</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export function CartView() {
  return (
    <RoleGuard roles={['customer']}>
      <CartInner />
    </RoleGuard>
  );
}

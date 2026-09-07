'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  adjustInventory,
  getInventoryLogs,
  getLowStock,
} from '@/controllers/inventory.controller';
import { listProductsForStaff } from '@/controllers/products.controller';
import { inventoryAdjustSchema, InventoryAdjustInput } from '@/models/schemas';
import { InventoryLog, Product } from '@/models/types';
import { formatDate } from '@/lib/format';
import { apiErrorMessage } from '@/lib/api';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { RoleGuard } from '@/components/RoleGuard';

function InventoryInner() {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InventoryAdjustInput>({ resolver: zodResolver(inventoryAdjustSchema) });

  function load() {
    listProductsForStaff().then(setProducts);
    getInventoryLogs().then(setLogs);
    getLowStock(10).then(setLowStock);
  }

  useEffect(load, []);

  async function onSubmit(values: InventoryAdjustInput) {
    setError('');
    setMessage('');
    try {
      await adjustInventory(values);
      setMessage('Stock updated.');
      reset({ productId: '', type: 'restock', quantityChange: 0, reason: '' });
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Inventory</h1>
      <p className="mt-1 text-sm text-pine-700/60">Adjust stock levels and review recent movements.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="font-display text-lg text-ink">Adjust stock</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
            <Select label="Product" {...register('productId')} error={errors.productId?.message}>
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.stock} in stock)
                </option>
              ))}
            </Select>
            <Select label="Type" {...register('type')}>
              <option value="restock">Restock</option>
              <option value="adjustment">Adjustment</option>
              <option value="return">Return</option>
              <option value="sale">Manual sale</option>
            </Select>
            <Input
              label="Quantity change (use negative to remove)"
              type="number"
              {...register('quantityChange')}
              error={errors.quantityChange?.message}
            />
            <Input label="Reason (optional)" {...register('reason')} />
            {message && <p className="text-sm text-pine-700">{message}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Apply adjustment'}
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-display text-lg text-ink">Low stock (≤ 10 units)</h2>
          {lowStock.length === 0 ? (
            <p className="mt-3 text-sm text-pine-700/60">Nothing running low right now.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span className="text-ink">{p.name}</span>
                  <span className="font-medium text-copper-500">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}

          <h2 className="mt-6 font-display text-lg text-ink">Recent movements</h2>
          <div className="mt-3 max-h-72 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-pine-700/60">
                <tr>
                  <th className="py-1 font-medium">Product</th>
                  <th className="py-1 font-medium">Type</th>
                  <th className="py-1 font-medium">Change</th>
                  <th className="py-1 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2 text-ink">{log.product?.name || '—'}</td>
                    <td className="py-2 capitalize text-pine-700/70">{log.type}</td>
                    <td className={`py-2 font-medium ${log.quantityChange < 0 ? 'text-red-600' : 'text-pine-500'}`}>
                      {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                    </td>
                    <td className="py-2 text-pine-700/60">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function InventoryManagementView() {
  return (
    <RoleGuard roles={['admin', 'manager']}>
      <InventoryInner />
    </RoleGuard>
  );
}

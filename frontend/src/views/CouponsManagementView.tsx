'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '@/controllers/coupons.controller';
import { couponSchema, CouponInput } from '@/models/schemas';
import { Coupon } from '@/models/types';
import { formatCurrency, formatDate } from '@/lib/format';
import { apiErrorMessage } from '@/lib/api';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { EmptyState } from '@/components/EmptyState';
import { RoleGuard } from '@/components/RoleGuard';

function CouponsInner() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CouponInput>({ resolver: zodResolver(couponSchema) });

  function load() {
    listCoupons().then(setCoupons);
  }

  useEffect(load, []);

  function openCreate() {
    reset({ code: '', type: 'percentage', value: 10, minOrderAmount: 0 });
    setModalOpen(true);
  }

  async function onSubmit(values: CouponInput) {
    setError('');
    try {
      await createCoupon(values);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function toggleActive(coupon: Coupon) {
    await updateCoupon(coupon.id, { isActive: !coupon.isActive });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this coupon?')) return;
    await deleteCoupon(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Coupons</h1>
          <p className="mt-1 text-sm text-pine-700/60">Create discount codes customers can apply at checkout.</p>
        </div>
        <Button onClick={openCreate}>Add coupon</Button>
      </div>

      {coupons.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No coupons yet" />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-md border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-pine-700/60">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Min order</th>
                <th className="px-4 py-3 font-medium">Used</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-ink">{c.code}</td>
                  <td className="px-4 py-3 text-pine-700/70">
                    {c.type === 'percentage' ? `${c.value}%` : formatCurrency(c.value)}
                  </td>
                  <td className="px-4 py-3 text-pine-700/70">{formatCurrency(c.minOrderAmount)}</td>
                  <td className="px-4 py-3 text-pine-700/70">
                    {c.usedCount}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ''}
                  </td>
                  <td className="px-4 py-3 text-pine-700/70">
                    {c.expiresAt ? formatDate(c.expiresAt) : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(c)}
                      className={c.isActive ? 'text-pine-500' : 'text-pine-700/40'}
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add coupon">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Code" {...register('code')} error={errors.code?.message} placeholder="WELCOME10" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" {...register('type')}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </Select>
            <Input label="Value" type="number" step="0.01" {...register('value')} error={errors.value?.message} />
          </div>
          <Input label="Minimum order amount" type="number" step="0.01" {...register('minOrderAmount')} />
          <Input label="Usage limit (optional)" type="number" {...register('usageLimit')} />
          <Input label="Expires at (optional)" type="date" {...register('expiresAt')} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Add coupon'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

export function CouponsManagementView() {
  return (
    <RoleGuard roles={['admin']}>
      <CouponsInner />
    </RoleGuard>
  );
}

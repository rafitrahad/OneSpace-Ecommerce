'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, CheckoutInput } from '@/models/schemas';
import { checkout } from '@/controllers/orders.controller';
import { apiErrorMessage } from '@/lib/api';
import { Input, Textarea } from '@/components/Input';
import { Select } from '@/components/Select';
import { Button } from '@/components/Button';
import { RoleGuard } from '@/components/RoleGuard';

function CheckoutInner() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'cod' },
  });

  const paymentMethod = watch('paymentMethod');

  async function onSubmit(values: CheckoutInput) {
    setServerError('');
    try {
      const order = await checkout(values);
      router.push(`/orders?placed=${order.id}`);
    } catch (err) {
      setServerError(apiErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="font-display text-3xl text-ink">Checkout</h1>
      <p className="mt-1 text-sm text-pine-700/60">Confirm delivery and payment details to place your order.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
        <Input
          label="Shipping address"
          {...register('shippingAddress')}
          error={errors.shippingAddress?.message}
        />
        <Textarea label="Order note (optional)" rows={3} {...register('note')} />

        <Select label="Payment method" {...register('paymentMethod')}>
          <option value="cod">Cash on delivery</option>
          <option value="bkash">bKash</option>
          <option value="nagad">Nagad</option>
        </Select>

        {paymentMethod !== 'cod' && (
          <div className="rounded-md border border-line bg-paper p-3 text-sm text-pine-700/80">
            Send the total amount to our {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} merchant
            number, then enter the transaction ID you received below. Your order will be
            confirmed once staff verify the payment.
          </div>
        )}

        {paymentMethod !== 'cod' && (
          <Input
            label="Transaction ID"
            {...register('paymentTransactionId')}
            error={errors.paymentTransactionId?.message}
          />
        )}

        <Input
          label="Coupon code (optional)"
          {...register('couponCode')}
          placeholder="e.g. WELCOME10"
        />

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Placing order…' : 'Place order'}
        </Button>
      </form>
    </div>
  );
}

export function CheckoutView() {
  return (
    <RoleGuard roles={['customer']}>
      <CheckoutInner />
    </RoleGuard>
  );
}

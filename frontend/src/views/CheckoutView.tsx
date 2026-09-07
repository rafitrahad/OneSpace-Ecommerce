'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, CheckoutInput } from '@/models/schemas';
import { checkout } from '@/controllers/orders.controller';
import { apiErrorMessage } from '@/lib/api';
import { Input, Textarea } from '@/components/Input';
import { Button } from '@/components/Button';
import { RoleGuard } from '@/components/RoleGuard';

function CheckoutInner() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({ resolver: zodResolver(checkoutSchema) });

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
      <p className="mt-1 text-sm text-pine-700/60">Confirm delivery details to place your order.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
        <Input
          label="Shipping address"
          {...register('shippingAddress')}
          error={errors.shippingAddress?.message}
        />
        <Textarea label="Order note (optional)" rows={3} {...register('note')} />
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

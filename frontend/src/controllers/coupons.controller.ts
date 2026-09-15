import { api } from '@/lib/api';
import { Coupon } from '@/models/types';
import { CouponInput } from '@/models/schemas';

export async function listCoupons() {
  const { data } = await api.get<Coupon[]>('/coupons');
  return data;
}

export async function createCoupon(input: CouponInput) {
  const { data } = await api.post<Coupon>('/coupons', input);
  return data;
}

export async function updateCoupon(id: string, input: Partial<CouponInput> & { isActive?: boolean }) {
  const { data } = await api.patch<Coupon>(`/coupons/${id}`, input);
  return data;
}

export async function deleteCoupon(id: string) {
  const { data } = await api.delete(`/coupons/${id}`);
  return data;
}

import { api } from '@/lib/api';
import { Order, OrderStatus } from '@/models/types';
import { CheckoutInput } from '@/models/schemas';

export async function checkout(input: CheckoutInput) {
  const { data } = await api.post<Order>('/orders/checkout', input);
  return data;
}

export async function myOrders() {
  const { data } = await api.get<Order[]>('/orders/mine');
  return data;
}

export async function allOrders() {
  const { data } = await api.get<Order[]>('/orders');
  return data;
}

export async function getOrder(id: string) {
  const { data } = await api.get<Order>(`/orders/${id}`);
  return data;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { data } = await api.patch<Order>(`/orders/${id}/status`, { status });
  return data;
}

export async function cancelOrder(id: string) {
  const { data } = await api.patch<Order>(`/orders/${id}/cancel`);
  return data;
}

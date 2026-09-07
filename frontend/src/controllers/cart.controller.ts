import { api } from '@/lib/api';
import { CartItem } from '@/models/types';

export async function getCart() {
  const { data } = await api.get<CartItem[]>('/cart');
  return data;
}

export async function addToCart(productId: string, quantity: number) {
  const { data } = await api.post<CartItem>('/cart', { productId, quantity });
  return data;
}

export async function updateCartItem(id: string, quantity: number) {
  const { data } = await api.patch<CartItem>(`/cart/${id}`, { quantity });
  return data;
}

export async function removeCartItem(id: string) {
  const { data } = await api.delete(`/cart/${id}`);
  return data;
}

export async function clearCart() {
  const { data } = await api.delete('/cart');
  return data;
}

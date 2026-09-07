import { api } from '@/lib/api';
import { InventoryLog, Product } from '@/models/types';
import { InventoryAdjustInput } from '@/models/schemas';

export async function adjustInventory(input: InventoryAdjustInput) {
  const { data } = await api.post<InventoryLog>('/inventory/adjust', input);
  return data;
}

export async function getInventoryLogs(productId?: string) {
  const { data } = await api.get<InventoryLog[]>('/inventory/logs', {
    params: productId ? { productId } : {},
  });
  return data;
}

export async function getLowStock(threshold?: number) {
  const { data } = await api.get<Product[]>('/inventory/low-stock', {
    params: threshold ? { threshold } : {},
  });
  return data;
}

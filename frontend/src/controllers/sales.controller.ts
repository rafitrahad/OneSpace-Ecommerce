import { api } from '@/lib/api';
import { SalesSummary, TopProduct } from '@/models/types';

export async function getSalesSummary() {
  const { data } = await api.get<SalesSummary>('/sales/summary');
  return data;
}

export async function getTopProducts(limit?: number) {
  const { data } = await api.get<TopProduct[]>('/sales/top-products', {
    params: limit ? { limit } : {},
  });
  return data;
}

export async function getRevenueByDay(days?: number) {
  const { data } = await api.get('/sales/revenue-by-day', {
    params: days ? { days } : {},
  });
  return data as { date: string; revenue: number; orders: number }[];
}

async function downloadCsv(path: string, filename: string) {
  const { data } = await api.get(path, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function downloadSalesCsv() {
  return downloadCsv('/sales/export/csv', 'sales-report.csv');
}

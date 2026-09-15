import { api } from '@/lib/api';
import { Product, PaginatedProducts, VariantGroup } from '@/models/types';

export interface ProductQuery {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// What actually gets sent to the API - distinct from the raw form shape
// (ProductInput), which uses a friendlier `variantsText` for editing.
export interface ProductPayload {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  images?: string[];
  variants?: VariantGroup[];
  categoryId?: string;
  isActive?: boolean;
}

export async function listProducts(query: ProductQuery = {}) {
  const { data } = await api.get<PaginatedProducts>('/products', { params: query });
  return data;
}

export async function getProduct(id: string) {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
}

export async function getRelatedProducts(id: string) {
  const { data } = await api.get<Product[]>(`/products/${id}/related`);
  return data;
}

export async function listProductsForStaff() {
  const { data } = await api.get<Product[]>('/products/staff/all');
  return data;
}

export async function createProduct(input: ProductPayload) {
  const { data } = await api.post<Product>('/products', input);
  return data;
}

export async function updateProduct(id: string, input: Partial<ProductPayload>) {
  const { data } = await api.patch<Product>(`/products/${id}`, input);
  return data;
}

export async function deleteProduct(id: string) {
  const { data } = await api.delete(`/products/${id}`);
  return data;
}

// Uploads an image file and returns the absolute URL to store in a product's imageUrl.
export async function uploadProductImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<{ url: string }>('/products/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
}

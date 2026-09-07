import { api } from '@/lib/api';
import { Category } from '@/models/types';
import { CategoryInput } from '@/models/schemas';

export async function listCategories() {
  const { data } = await api.get<Category[]>('/categories');
  return data;
}

export async function createCategory(input: CategoryInput) {
  const { data } = await api.post<Category>('/categories', input);
  return data;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>) {
  const { data } = await api.patch<Category>(`/categories/${id}`, input);
  return data;
}

export async function deleteCategory(id: string) {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
}

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/controllers/categories.controller';
import { categorySchema, CategoryInput } from '@/models/schemas';
import { Category } from '@/models/types';
import { apiErrorMessage } from '@/lib/api';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Input, Textarea } from '@/components/Input';
import { EmptyState } from '@/components/EmptyState';
import { RoleGuard } from '@/components/RoleGuard';

function CategoriesInner() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({ resolver: zodResolver(categorySchema) });

  function load() {
    listCategories().then(setCategories);
  }

  useEffect(load, []);

  function openCreate() {
    setEditing(null);
    reset({ name: '', description: '' });
    setModalOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    reset({ name: category.name, description: category.description || '' });
    setModalOpen(true);
  }

  async function onSubmit(values: CategoryInput) {
    setError('');
    try {
      if (editing) {
        await updateCategory(editing.id, values);
      } else {
        await createCategory(values);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return;
    await deleteCategory(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Categories</h1>
          <p className="mt-1 text-sm text-pine-700/60">Organize the catalog into shopping categories.</p>
        </div>
        <Button onClick={openCreate}>Add category</Button>
      </div>

      {categories.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No categories yet" />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.id} className="rounded-md border border-line bg-surface p-4">
              <h3 className="font-display text-lg text-ink">{c.name}</h3>
              <p className="mt-1 text-sm text-pine-700/60">{c.description || 'No description'}</p>
              <div className="mt-3 flex gap-3 text-sm">
                <button onClick={() => openEdit(c)} className="text-pine-500 hover:underline">
                  Edit
                </button>
                <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit category' : 'Add category'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Name" {...register('name')} error={errors.name?.message} />
          <Textarea label="Description" rows={3} {...register('description')} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : editing ? 'Save changes' : 'Add category'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

export function CategoriesManagementView() {
  return (
    <RoleGuard roles={['admin']}>
      <CategoriesInner />
    </RoleGuard>
  );
}

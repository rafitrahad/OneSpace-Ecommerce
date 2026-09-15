'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  listProductsForStaff,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from '@/controllers/products.controller';
import { listCategories } from '@/controllers/categories.controller';
import { productSchema, ProductInput } from '@/models/schemas';
import { Product, Category, VariantGroup } from '@/models/types';
import { formatCurrency } from '@/lib/format';
import { apiErrorMessage } from '@/lib/api';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Input, Textarea } from '@/components/Input';
import { Select } from '@/components/Select';
import { EmptyState } from '@/components/EmptyState';
import { RoleGuard } from '@/components/RoleGuard';

// "Size: S, M, L" per line <-> VariantGroup[]
function parseVariantsText(text: string): VariantGroup[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, optionsStr] = line.split(':');
      const options = (optionsStr || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
      return { name: (name || '').trim(), options };
    })
    .filter((g) => g.name && g.options.length > 0);
}

function stringifyVariants(variants?: VariantGroup[] | null): string {
  if (!variants || variants.length === 0) return '';
  return variants.map((g) => `${g.name}: ${g.options.join(', ')}`).join('\n');
}

function ProductsInner() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({ resolver: zodResolver(productSchema) });

  const currentImageUrl = watch('imageUrl');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      if (!currentImageUrl) {
        setValue('imageUrl', url, { shouldDirty: true });
      } else {
        setGallery((prev) => [...prev, url]);
      }
    } catch (err) {
      setUploadError(apiErrorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function removeGalleryImage(url: string) {
    setGallery((prev) => prev.filter((g) => g !== url));
  }

  function load() {
    listProductsForStaff().then(setProducts);
  }

  useEffect(() => {
    load();
    listCategories().then(setCategories);
  }, []);

  function openCreate() {
    setEditing(null);
    setGallery([]);
    reset({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      imageUrl: '',
      variantsText: '',
      categoryId: '',
    });
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setGallery(product.images || []);
    reset({
      name: product.name,
      description: product.description || '',
      price: Number(product.price),
      stock: product.stock,
      imageUrl: product.imageUrl || '',
      variantsText: stringifyVariants(product.variants),
      categoryId: product.categoryId || '',
    });
    setModalOpen(true);
  }

  async function onSubmit(values: ProductInput) {
    setError('');
    try {
      const { variantsText, ...rest } = values;
      const payload = {
        ...rest,
        categoryId: values.categoryId || undefined,
        images: gallery,
        variants: variantsText ? parseVariantsText(variantsText) : [],
      };
      if (editing) {
        await updateProduct(editing.id, payload);
      } else {
        await createProduct(payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await deleteProduct(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Products</h1>
          <p className="mt-1 text-sm text-pine-700/60">Add, edit, or remove products from the catalog.</p>
        </div>
        <Button onClick={openCreate}>Add product</Button>
      </div>

      {products.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No products yet" hint="Add your first product to start selling." />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-md border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-pine-700/60">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-ink">{p.name}</td>
                  <td className="px-4 py-3 text-pine-700/70">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3 text-ink">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3 text-ink">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={p.isActive ? 'text-pine-500' : 'text-pine-700/40'}>
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(p)} className="mr-3 text-pine-500 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit product' : 'Add product'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Name" {...register('name')} error={errors.name?.message} />
          <Textarea label="Description" rows={3} {...register('description')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" type="number" step="0.01" {...register('price')} error={errors.price?.message} />
            <Input label="Stock" type="number" {...register('stock')} error={errors.stock?.message} />
          </div>
          <Select label="Category" {...register('categoryId')}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <div>
            <Input label="Cover image URL" {...register('imageUrl')} placeholder="https://..." />
            <div className="mt-2 flex items-center gap-3">
              <label className="cursor-pointer rounded-pill border border-line px-3 py-1.5 text-xs font-medium text-pine-700 hover:bg-pine-50">
                {uploading ? 'Uploading…' : currentImageUrl ? 'Add gallery photo' : 'Upload a file instead'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileSelected}
                  disabled={uploading}
                />
              </label>
              {currentImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentImageUrl} alt="Cover preview" className="h-10 w-10 rounded object-cover" />
              )}
            </div>
            {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}

            {gallery.length > 0 && (
              <div className="mt-2">
                <p className="mb-1 text-xs text-pine-700/60">Additional gallery photos:</p>
                <div className="flex flex-wrap gap-2">
                  {gallery.map((url) => (
                    <div key={url} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-12 w-12 rounded object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(url)}
                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Textarea
            label="Variants (optional)"
            rows={2}
            placeholder={'Size: S, M, L\nColor: Black, White'}
            {...register('variantsText')}
          />
          <p className="-mt-3 text-xs text-pine-700/50">
            One group per line, format: Group name: option1, option2, option3
          </p>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

export function ProductsManagementView() {
  return (
    <RoleGuard roles={['admin', 'manager']}>
      <ProductsInner />
    </RoleGuard>
  );
}

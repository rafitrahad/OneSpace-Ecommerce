'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { listProducts } from '@/controllers/products.controller';
import { listCategories } from '@/controllers/categories.controller';
import { Product, Category } from '@/models/types';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState } from '@/components/EmptyState';
import { Select } from '@/components/Select';
import { Input } from '@/components/Input';

export function HomeView() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [categoryId, setCategoryId] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);

  // Re-sync when the URL's ?search= changes (e.g. from the top Navbar search box)
  // while HomeView is already mounted, since useState only reads it once on mount.
  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    listCategories().then(setCategories).catch(() => undefined);
  }, []);

  useEffect(() => {
    setLoading(true);
    listProducts({
      search: search || undefined,
      categoryId: categoryId || undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      limit: 24,
    })
      .then((res) => setProducts(res.items))
      .finally(() => setLoading(false));
  }, [search, categoryId, maxPrice]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <section className="mb-10 rounded-md border border-line bg-surface p-8">
        <h1 className="font-display text-4xl text-ink">Everyday goods, thoughtfully stocked</h1>
        <p className="mt-2 max-w-xl text-pine-700/70">
          Browse the current catalog, filter by category or price, and add what you need to your cart.
        </p>
      </section>

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="w-56">
          <Input
            label="Search"
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <Input
            label="Max price"
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-pine-700/60">Loading products…</p>
      ) : products.length === 0 ? (
        <EmptyState title="No products match your filters" hint="Try clearing search or price filters." />
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProduct } from '@/controllers/products.controller';
import { addToCart } from '@/controllers/cart.controller';
import { Product } from '@/models/types';
import { formatCurrency } from '@/lib/format';
import { useAuth } from '@/controllers/auth.controller';
import { apiErrorMessage } from '@/lib/api';
import { Button } from '@/components/Button';

export function ProductDetailView({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    getProduct(id).then(setProduct).catch(() => setProduct(null));
  }, [id]);

  async function handleAddToCart() {
    setMessage('');
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'customer') {
      setMessage('Only customer accounts can add items to a cart.');
      return;
    }
    try {
      await addToCart(id, quantity);
      setMessage('Added to cart.');
    } catch (err) {
      setMessage(apiErrorMessage(err));
    }
  }

  if (!product) {
    return <p className="mx-auto max-w-4xl px-6 py-16 text-sm text-pine-700/60">Loading…</p>;
  }

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-2">
      <div className="flex aspect-square items-center justify-center rounded-md bg-pine-50 text-pine-300">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="h-full w-full rounded-md object-cover" />
        ) : (
          <span className="font-display text-6xl">{product.name.charAt(0)}</span>
        )}
      </div>
      <div>
        {product.category && <p className="text-sm text-pine-700/50">{product.category.name}</p>}
        <h1 className="mt-1 font-display text-3xl text-ink">{product.name}</h1>
        <p className="mt-4 text-pine-700/80">{product.description}</p>
        <p className="mt-6 font-display text-2xl text-ink">{formatCurrency(product.price)}</p>
        <p className="mt-1 text-sm text-pine-700/60">
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>

        <div className="mt-6 flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={product.stock || 1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="w-20 rounded border border-line px-3 py-2 text-sm"
          />
          <Button onClick={handleAddToCart} disabled={product.stock <= 0}>
            Add to cart
          </Button>
        </div>
        {message && <p className="mt-3 text-sm text-pine-700">{message}</p>}
      </div>
    </div>
  );
}

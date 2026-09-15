'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getProduct, getRelatedProducts } from '@/controllers/products.controller';
import { addToCart } from '@/controllers/cart.controller';
import { getReviews, getReviewSummary, createReview, deleteReview } from '@/controllers/reviews.controller';
import { Product, Review, ReviewSummary } from '@/models/types';
import { reviewSchema, ReviewInput } from '@/models/schemas';
import { formatCurrency, formatDate } from '@/lib/format';
import { useAuth } from '@/controllers/auth.controller';
import { apiErrorMessage } from '@/lib/api';
import { Button } from '@/components/Button';
import { Textarea } from '@/components/Input';
import { StarDisplay, StarPicker } from '@/components/StarRating';
import { ProductCard } from '@/components/ProductCard';

export function ProductDetailView({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    getProduct(id).then((p) => {
      setProduct(p);
      setActiveImage(p.imageUrl || p.images?.[0] || '');
    }).catch(() => setProduct(null));
    getRelatedProducts(id).then(setRelated).catch(() => undefined);
  }, [id]);

  const gallery = useMemo(() => {
    if (!product) return [];
    const list = [product.imageUrl, ...(product.images || [])].filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [product]);

  const variantText = useMemo(() => {
    const entries = Object.entries(selectedVariants);
    if (entries.length === 0) return undefined;
    return entries.map(([name, value]) => `${name}: ${value}`).join(', ');
  }, [selectedVariants]);

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
    if (product?.variants?.length && Object.keys(selectedVariants).length < product.variants.length) {
      setMessage('Please select an option for every variant.');
      return;
    }
    try {
      await addToCart(id, quantity, variantText);
      setMessage('Added to cart.');
    } catch (err) {
      setMessage(apiErrorMessage(err));
    }
  }

  if (!product) {
    return <p className="mx-auto max-w-4xl px-6 py-16 text-sm text-pine-700/60">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <div className="flex aspect-square items-center justify-center rounded-md bg-pine-50 text-pine-300">
            {activeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeImage} alt={product.name} className="h-full w-full rounded-md object-cover" />
            ) : (
              <span className="font-display text-6xl">{product.name.charAt(0)}</span>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2">
              {gallery.map((img) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(img)}
                  className={`h-14 w-14 overflow-hidden rounded border ${
                    activeImage === img ? 'border-pine-500' : 'border-line'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.category && <p className="text-sm text-pine-700/50">{product.category.name}</p>}
          <h1 className="mt-1 font-display text-3xl text-ink">{product.name}</h1>
          <ReviewSummaryLine productId={id} />
          <p className="mt-4 text-pine-700/80">{product.description}</p>
          <p className="mt-6 font-display text-2xl text-ink">{formatCurrency(product.price)}</p>
          <p className="mt-1 text-sm text-pine-700/60">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          {product.variants?.map((group) => (
            <div key={group.name} className="mt-4">
              <p className="mb-1 text-sm font-medium text-ink">{group.name}</p>
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => (
                  <button
                    key={option}
                    onClick={() =>
                      setSelectedVariants((prev) => ({ ...prev, [group.name]: option }))
                    }
                    className={`rounded-pill border px-3 py-1.5 text-sm ${
                      selectedVariants[group.name] === option
                        ? 'border-pine-500 bg-pine-500 text-white'
                        : 'border-line text-ink hover:bg-pine-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}

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

      <ReviewsSection productId={id} />

      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-2xl text-ink">You may also like</h2>
          <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewSummaryLine({ productId }: { productId: string }) {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  useEffect(() => {
    getReviewSummary(productId).then(setSummary).catch(() => undefined);
  }, [productId]);
  if (!summary) return null;
  return (
    <div className="mt-2">
      <StarDisplay rating={summary.average} count={summary.count} />
    </div>
  );
}

function ReviewsSection({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(5);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<ReviewInput>({ resolver: zodResolver(reviewSchema), defaultValues: { rating: 5 } });

  function load() {
    getReviews(productId).then(setReviews);
  }

  useEffect(load, [productId]);

  function selectRating(value: number) {
    setRating(value);
    setValue('rating', value);
  }

  async function onSubmit(values: ReviewInput) {
    setError('');
    try {
      await createReview(productId, values);
      reset({ rating: 5, comment: '' });
      setRating(5);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function handleDelete(reviewId: string) {
    if (!confirm('Delete this review?')) return;
    await deleteReview(productId, reviewId);
    load();
  }

  return (
    <div className="mt-14 border-t border-line pt-10">
      <h2 className="font-display text-2xl text-ink">Reviews</h2>

      {user?.role === 'customer' && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 max-w-md rounded-md border border-line bg-surface p-4">
          <p className="mb-2 text-sm font-medium text-ink">Leave a review</p>
          <StarPicker value={rating} onChange={selectRating} />
          <input type="hidden" {...register('rating')} value={rating} />
          <Textarea placeholder="What did you think? (optional)" rows={3} {...register('comment')} className="mt-3" />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={isSubmitting} className="mt-3">
            {isSubmitting ? 'Submitting…' : 'Submit review'}
          </Button>
          <p className="mt-2 text-xs text-pine-700/50">
            Only available if you have a delivered order for this product.
          </p>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="mt-6 text-sm text-pine-700/60">No reviews yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-md border border-line bg-surface p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink">{r.user?.name || 'Customer'}</p>
                  <StarDisplay rating={r.rating} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-pine-700/50">{formatDate(r.createdAt)}</span>
                  {(user?.id === r.userId || user?.role === 'admin') && (
                    <button onClick={() => handleDelete(r.id)} className="text-xs text-red-600 hover:underline">
                      Delete
                    </button>
                  )}
                </div>
              </div>
              {r.comment && <p className="mt-2 text-sm text-pine-700/80">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from 'next/link';
import { Product } from '@/models/types';
import { formatCurrency } from '@/lib/format';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-md border border-line bg-surface transition-shadow hover:shadow-card"
    >
      <div className="flex aspect-square items-center justify-center bg-pine-50 text-pine-300">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-display text-4xl">{product.name.charAt(0)}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.category && (
          <span className="text-xs text-pine-700/50">{product.category.name}</span>
        )}
        <h3 className="font-display text-lg text-ink">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-medium text-ink">{formatCurrency(product.price)}</span>
          {product.stock <= 0 ? (
            <span className="text-xs text-red-600">Out of stock</span>
          ) : product.stock <= 10 ? (
            <span className="text-xs text-copper-500">Low stock</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const discount = product.compareAtPrice
    ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
    : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-gray-100 overflow-hidden relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-500">{product.category}</p>
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mt-0.5 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mt-1 text-xs text-amber-500">
          {"★".repeat(Math.round(product.rating))}
          <span className="text-gray-400">({product.reviewCount})</span>
        </div>
        <div className="flex items-baseline gap-2 mt-1.5">
          <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

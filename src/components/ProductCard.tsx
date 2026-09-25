"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { discountPercent, isDigital } from "@/lib/product-utils";
import { useT } from "@/lib/i18n/client";

export default function ProductCard({ product }: { product: Product }) {
  const t = useT();
  const discount = discountPercent(product);
  const digital = isDigital(product);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-surface rounded-card border border-border overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-primary-soft overflow-hidden relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <span className="absolute top-2 start-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-btn">
            -{discount}%
          </span>
        )}
        {digital && (
          <span className="absolute top-2 end-2 inline-flex items-center gap-1 bg-surface/95 text-primary text-[11px] font-semibold px-2 py-1 rounded-btn shadow-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            </svg>
            {t.product.digital}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-muted truncate">{product.brand ? `${product.brand} · ${product.category}` : product.category}</p>
        <h3 className="text-sm font-medium text-foreground line-clamp-2 mt-0.5 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mt-1 text-xs text-accent">
          {"★".repeat(Math.round(product.rating))}
          <span className="text-muted">({product.reviewCount})</span>
        </div>
        <div className="flex items-baseline gap-2 mt-1.5">
          <span className="text-base font-bold text-foreground">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-muted line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
        {digital ? (
          <p className="text-[11px] text-primary mt-1">{t.product.instantDownload}</p>
        ) : product.stock === 0 ? (
          <p className="text-[11px] text-red-600 mt-1">{t.product.outOfStock}</p>
        ) : null}
      </div>
    </Link>
  );
}

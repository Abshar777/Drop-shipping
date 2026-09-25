"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { useT } from "@/lib/i18n/client";
import { fmt } from "@/lib/i18n";
import { isDigital } from "@/lib/product-utils";
import type { CartItem, Product } from "@/lib/types";

type Row = { item: CartItem; product: Product };

/** Downloads are bought once, whatever the stored quantity says. */
const qtyOf = ({ item, product }: Row) => (isDigital(product) ? 1 : item.quantity);

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const t = useT();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-12 text-center text-muted">{t.cart.loading}</div>;
  }

  const cartRows = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { item, product } : null;
    })
    .filter((row): row is Row => row !== null);

  const subtotal = cartRows.reduce((sum, row) => sum + row.product.price * qtyOf(row), 0);
  const allDigital = cartRows.length > 0 && cartRows.every((row) => isDigital(row.product));

  if (cartRows.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t.cart.empty}</h1>
        <p className="text-muted mb-6">{t.cart.emptyHint}</p>
        <Link href="/products" className="inline-block bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-btn hover:bg-primary-hover">
          {t.cart.browse}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">{t.cart.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cartRows.map((row) => {
            const { item, product } = row;
            const digital = isDigital(product);
            const qty = qtyOf(row);
            return (
              <div key={product.id} className="flex gap-4 bg-surface border border-border rounded-card p-4">
                <Link href={`/products/${product.slug}`} className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-input"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${product.slug}`} className="font-medium text-foreground hover:text-primary line-clamp-1">
                    {product.name}
                  </Link>
                  <p className="text-sm text-muted mt-0.5">{fmt(t.cart.each, { price: formatPrice(product.price) })}</p>
                  {digital && (
                    <p className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary-soft rounded-btn px-2 py-0.5 mt-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                      </svg>
                      {t.cart.digitalNote}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-3">
                    {digital ? (
                      <span className="border border-border text-muted rounded-input px-2 py-1 text-sm">{t.cart.qtyOne}</span>
                    ) : (
                      <select
                        value={item.quantity}
                        onChange={(e) => updateQuantity(product.id, Number(e.target.value))}
                        className="border border-border bg-background text-foreground rounded-input px-2 py-1 text-sm"
                      >
                        {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      {t.cart.remove}
                    </button>
                  </div>
                </div>
                <div className="text-end font-semibold text-foreground shrink-0">
                  {formatPrice(product.price * qty)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-surface border border-border rounded-card p-5 h-fit">
          <h2 className="font-bold text-foreground mb-4">{t.cart.summary}</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">{t.cart.subtotal}</span>
            <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-muted">{t.cart.shipping}</span>
            <span className="font-medium text-green-600">{allDigital ? t.cart.noShipping : t.cart.free}</span>
          </div>
          <div className="flex justify-between font-bold text-foreground border-t border-border pt-4 mb-4">
            <span>{t.cart.total}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Link
            href="/checkout"
            className="block text-center bg-primary text-primary-foreground font-semibold py-2.5 rounded-btn hover:bg-primary-hover"
          >
            {t.cart.checkout}
          </Link>
        </div>
      </div>
    </div>
  );
}

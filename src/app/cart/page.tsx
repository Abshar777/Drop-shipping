"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { useT } from "@/lib/i18n/client";
import { fmt } from "@/lib/i18n";
import type { Product } from "@/lib/types";

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
    return <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-500">{t.cart.loading}</div>;
  }

  const cartRows = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { item, product } : null;
    })
    .filter((row): row is { item: (typeof items)[number]; product: Product } => row !== null);

  const subtotal = cartRows.reduce((sum, row) => sum + row.product.price * row.item.quantity, 0);

  if (cartRows.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.cart.empty}</h1>
        <p className="text-gray-500 mb-6">{t.cart.emptyHint}</p>
        <Link href="/products" className="inline-block bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-md hover:bg-orange-700">
          {t.cart.browse}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t.cart.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cartRows.map(({ item, product }) => (
            <div key={product.id} className="flex gap-4 bg-white border border-gray-200 rounded-lg p-4">
              <Link href={`/products/${product.slug}`} className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${product.slug}`} className="font-medium text-gray-900 hover:text-orange-600 line-clamp-1">
                  {product.name}
                </Link>
                <p className="text-sm text-gray-500 mt-0.5">{fmt(t.cart.each, { price: formatPrice(product.price) })}</p>

                <div className="flex items-center gap-3 mt-3">
                  <select
                    value={item.quantity}
                    onChange={(e) => updateQuantity(product.id, Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  >
                    {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    {t.cart.remove}
                  </button>
                </div>
              </div>
              <div className="text-end font-semibold text-gray-900 shrink-0">
                {formatPrice(product.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 h-fit">
          <h2 className="font-bold text-gray-900 mb-4">{t.cart.summary}</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">{t.cart.subtotal}</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-gray-600">{t.cart.shipping}</span>
            <span className="font-medium text-green-600">{t.cart.free}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-4 mb-4">
            <span>{t.cart.total}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Link
            href="/checkout"
            className="block text-center bg-orange-600 text-white font-semibold py-2.5 rounded-md hover:bg-orange-700"
          >
            {t.cart.checkout}
          </Link>
        </div>
      </div>
    </div>
  );
}

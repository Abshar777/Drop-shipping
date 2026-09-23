"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useT } from "@/lib/i18n/client";

export default function AddToCart({ productId, stock }: { productId: string; stock: number }) {
  const { addItem } = useCart();
  const t = useT();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(productId, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    addItem(productId, quantity);
    router.push("/cart");
  }

  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <div className="flex items-center gap-3">
        <label htmlFor="qty" className="text-sm font-medium text-gray-700">
          {t.product.quantity}
        </label>
        <select
          id="qty"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
        >
          {Array.from({ length: Math.min(stock, 10) }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          disabled={stock === 0}
          className="flex-1 bg-orange-100 text-orange-700 font-semibold py-2.5 rounded-md hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {added ? t.product.added : t.product.addToCart}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={stock === 0}
          className="flex-1 bg-orange-600 text-white font-semibold py-2.5 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t.product.buyNow}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useT } from "@/lib/i18n/client";

type Variant = "theme" | "amazon" | "flipkart";

const STYLES: Record<Variant, { wrap: string; buttons: string; add: string; buy: string; label: string; select: string }> = {
  theme: {
    wrap: "flex flex-col gap-3 max-w-sm",
    buttons: "flex gap-3",
    add: "flex-1 bg-primary-soft text-primary font-semibold py-2.5 rounded-btn hover:bg-primary hover:text-primary-foreground transition-colors",
    buy: "flex-1 bg-primary text-primary-foreground font-semibold py-2.5 rounded-btn hover:bg-primary-hover",
    label: "text-sm font-medium text-foreground",
    select: "border border-border bg-surface text-foreground rounded-input px-2 py-1.5 text-sm",
  },
  amazon: {
    wrap: "flex flex-col gap-2.5",
    buttons: "flex flex-col gap-2",
    add: "w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-sm py-2 rounded-full border border-[#FCD200] shadow-sm",
    buy: "w-full bg-[#FFA41C] hover:bg-[#FA8900] text-[#0F1111] text-sm py-2 rounded-full border border-[#FF8F00] shadow-sm",
    label: "text-sm text-[#0F1111]",
    select: "bg-[#F0F2F2] border border-[#D5D9D9] rounded-lg px-2 py-1 text-sm text-[#0F1111] shadow-sm",
  },
  flipkart: {
    wrap: "flex flex-col gap-3",
    buttons: "flex gap-3",
    add: "flex-1 bg-[#ff9f00] hover:bg-[#f39400] text-white font-medium uppercase tracking-wide py-3.5 rounded-sm shadow",
    buy: "flex-1 bg-[#fb641b] hover:bg-[#f05a13] text-white font-medium uppercase tracking-wide py-3.5 rounded-sm shadow",
    label: "text-sm text-[#212121]",
    select: "border border-[#e0e0e0] rounded-sm px-2 py-1 text-sm text-[#212121] bg-white",
  },
};

export default function AddToCart({
  productId,
  stock,
  variant = "theme",
  showQuantity = true,
}: {
  productId: string;
  stock: number;
  variant?: Variant;
  showQuantity?: boolean;
}) {
  const { addItem } = useCart();
  const t = useT();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const s = STYLES[variant];

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
    <div className={s.wrap}>
      {showQuantity && (
        <div className="flex items-center gap-3">
          <label htmlFor="qty" className={s.label}>
            {t.product.quantity}
          </label>
          <select id="qty" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className={s.select}>
            {Array.from({ length: Math.min(stock, 10) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={s.buttons}>
        <button
          onClick={handleAdd}
          disabled={stock === 0}
          className={`${s.add} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {added ? t.product.added : t.product.addToCart}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={stock === 0}
          className={`${s.buy} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {t.product.buyNow}
        </button>
      </div>
    </div>
  );
}

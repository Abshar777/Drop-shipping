// Product page layouts the admin can pick per product.
import type { ProductLayout } from "./types";

export const PRODUCT_LAYOUTS: Array<{ id: ProductLayout; name: string; tagline: string }> = [
  {
    id: "default",
    name: "Store theme",
    tagline: "Follows the colours and font of the active theme.",
  },
  {
    id: "amazon",
    name: "Amazon style",
    tagline: "Three columns: gallery, details with 'About this item', and a buy box.",
  },
  {
    id: "flipkart",
    name: "Flipkart style",
    tagline: "Sticky gallery with big Add to Cart and Buy Now, rating badge, offers, highlights.",
  },
];

export function isProductLayout(value: unknown): value is ProductLayout {
  return typeof value === "string" && PRODUCT_LAYOUTS.some((l) => l.id === value);
}

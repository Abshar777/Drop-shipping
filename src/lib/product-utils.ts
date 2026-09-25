// Small helpers about products that both server and client code need. Pure module.
import type { Product } from "./types";

/** Store-wide low-stock level, used when a product has no threshold of its own. */
export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export function isDigital(product: Pick<Product, "type">): boolean {
  return product.type === "digital";
}

export function lowStockThreshold(product: Pick<Product, "lowStockThreshold">): number {
  const own = product.lowStockThreshold;
  return typeof own === "number" && own >= 0 ? own : DEFAULT_LOW_STOCK_THRESHOLD;
}

/** Digital products never run low; physical ones do at or below their threshold. */
export function isLowStock(product: Pick<Product, "type" | "stock" | "lowStockThreshold">): boolean {
  return !isDigital(product) && product.stock <= lowStockThreshold(product);
}

/** Digital products are always purchasable; physical ones need stock. */
export function isPurchasable(product: Pick<Product, "type" | "stock">): boolean {
  return isDigital(product) || product.stock > 0;
}

export function discountPercent(product: Pick<Product, "price" | "compareAtPrice">): number {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return 0;
  return Math.round(100 - (product.price / product.compareAtPrice) * 100);
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatDimensions(d?: Product["dimensionsCm"]): string {
  if (!d) return "";
  const parts = [d.length, d.width, d.height].map((v) => (typeof v === "number" && v > 0 ? v : null));
  if (parts.every((v) => v === null)) return "";
  return parts.map((v) => (v === null ? "–" : String(v))).join(" × ") + " cm";
}

export function formatWeight(grams?: number): string {
  if (!grams || grams <= 0) return "";
  return grams >= 1000 ? `${(grams / 1000).toFixed(grams % 1000 === 0 ? 0 : 2)} kg` : `${grams} g`;
}

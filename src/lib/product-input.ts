// Turns an admin form / API body into clean product fields, with user-facing validation errors.
import { sanitizeHtml } from "./html";
import { isProductLayout } from "./product-layouts";
import type { Product } from "./types";

export type ProductFields = Omit<Product, "id" | "category" | "categoryId" | "rating" | "reviewCount">;

export type ProductInputResult = { ok: true; fields: ProductFields } | { ok: false; error: string };

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown): number | undefined => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = typeof v === "number" ? v : Number(String(v).trim());
  return Number.isFinite(n) ? n : undefined;
};
const url = (v: unknown): string | undefined => {
  const s = str(v, 2000);
  if (!s) return undefined;
  return /^(https?:\/\/|\/)/i.test(s) ? s : undefined;
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

/** Make `slug` unique among `existing`, ignoring the product being edited. */
export function uniqueSlug(slug: string, existing: Product[], selfId?: string): string {
  const taken = new Set(existing.filter((p) => p.id !== selfId).map((p) => p.slug));
  if (!taken.has(slug)) return slug;
  let n = 2;
  while (taken.has(`${slug}-${n}`)) n++;
  return `${slug}-${n}`;
}

/**
 * Validate and normalise everything except the category (looked up separately).
 * `current` supplies defaults when editing so unsent fields keep their values.
 */
export function parseProductInput(body: Record<string, unknown>, current?: Product): ProductInputResult {
  const has = (k: string) => body[k] !== undefined;
  const name = has("name") ? str(body.name, 160) : current?.name ?? "";
  if (!name) return { ok: false, error: "Product name is required" };

  const type: "physical" | "digital" = has("type") ? (body.type === "digital" ? "digital" : "physical") : current?.type === "digital" ? "digital" : "physical";

  const price = has("price") ? num(body.price) : current?.price;
  if (price === undefined || price < 0) return { ok: false, error: "Enter a valid price" };

  const compareAtPrice = has("compareAtPrice") ? num(body.compareAtPrice) : current?.compareAtPrice;
  if (compareAtPrice !== undefined && compareAtPrice < 0) return { ok: false, error: "Compare-at price cannot be negative" };
  if (compareAtPrice !== undefined && compareAtPrice > 0 && compareAtPrice < price) {
    return { ok: false, error: "Compare-at price should be higher than the selling price" };
  }

  const stockRaw = has("stock") ? num(body.stock) : current?.stock;
  const stock = type === "digital" ? (stockRaw ?? 0) : Math.max(0, Math.floor(stockRaw ?? 0));

  const images = has("images") ? (Array.isArray(body.images) ? body.images.filter((s): s is string => typeof s === "string" && s.trim() !== "").map((s) => s.trim()) : []) : current?.images ?? [];

  const requestedSlug = has("slug") ? slugify(str(body.slug, 120)) : current?.slug;
  const slug = requestedSlug || slugify(name);
  if (!slug) return { ok: false, error: "The URL needs at least one letter or number" };

  const dims = has("dimensionsCm") && body.dimensionsCm && typeof body.dimensionsCm === "object"
    ? (() => {
        const d = body.dimensionsCm as Record<string, unknown>;
        const out = { length: num(d.length), width: num(d.width), height: num(d.height) };
        return out.length || out.width || out.height ? out : undefined;
      })()
    : current?.dimensionsCm;

  const digital = type === "digital"
    ? (() => {
        const d = has("digital") && body.digital && typeof body.digital === "object" ? (body.digital as Record<string, unknown>) : undefined;
        const base = current?.digital ?? {};
        const out = {
          fileUrl: d ? url(d.fileUrl) : base.fileUrl,
          fileName: d ? str(d.fileName, 200) || undefined : base.fileName,
          fileSizeBytes: d ? num(d.fileSizeBytes) : base.fileSizeBytes,
          downloadLimit: d ? num(d.downloadLimit) : base.downloadLimit,
          downloadExpiryDays: d ? num(d.downloadExpiryDays) : base.downloadExpiryDays,
        };
        if (out.downloadLimit !== undefined && out.downloadLimit < 0) out.downloadLimit = undefined;
        if (out.downloadExpiryDays !== undefined && out.downloadExpiryDays < 0) out.downloadExpiryDays = undefined;
        return out;
      })()
    : undefined;

  const seo = has("seo") && body.seo && typeof body.seo === "object"
    ? (() => {
        const s = body.seo as Record<string, unknown>;
        const out = { title: str(s.title, 70) || undefined, description: str(s.description, 160) || undefined };
        return out.title || out.description ? out : undefined;
      })()
    : current?.seo;

  // A product that was a download has no meaningful shipping flag to carry over.
  const wasDigital = current?.type === "digital";
  const lowStock = has("lowStockThreshold") ? num(body.lowStockThreshold) : current?.lowStockThreshold;

  const fields: ProductFields = {
    slug,
    name,
    type,
    price,
    compareAtPrice: compareAtPrice && compareAtPrice > 0 ? compareAtPrice : undefined,
    images: images.length ? images : ["https://picsum.photos/seed/" + slug + "/600/600"],
    description: has("description") ? sanitizeHtml(str(body.description, 20000)) : current?.description ?? "",
    layout: has("layout") ? (isProductLayout(body.layout) && body.layout !== "default" ? body.layout : undefined) : current?.layout,
    videoUrl: has("videoUrl") ? url(body.videoUrl) : current?.videoUrl,
    collection: has("collection") ? str(body.collection, 80) || undefined : current?.collection,
    brand: has("brand") ? str(body.brand, 80) || undefined : current?.brand,
    sku: has("sku") ? str(body.sku, 64) || undefined : current?.sku,
    barcode: has("barcode") ? str(body.barcode, 64) || undefined : current?.barcode,
    stock,
    lowStockThreshold: lowStock !== undefined && lowStock >= 0 ? Math.floor(lowStock) : undefined,
    weightGrams: type === "physical" ? (has("weightGrams") ? num(body.weightGrams) : current?.weightGrams) : undefined,
    dimensionsCm: type === "physical" ? dims : undefined,
    shippingRequired: type === "physical" ? (has("shippingRequired") ? body.shippingRequired !== false && body.shippingRequired !== "false" : wasDigital ? true : current?.shippingRequired ?? true) : false,
    digital,
    seo,
    tags: has("tags") && Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === "string") : current?.tags ?? [],
  };
  return { ok: true, fields };
}

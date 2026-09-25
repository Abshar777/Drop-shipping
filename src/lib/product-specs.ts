// Storefront presentation helpers for the physical/digital differences. Pure module.
import type { Product } from "./types";
import type { Dictionary } from "./i18n";
import { fmt } from "./i18n";
import { formatDimensions, formatFileSize, formatWeight, isDigital } from "./product-utils";

export type SpecRow = { label: string; value: string };

/** "PDF", "ZIP", ... taken from the digital file name or URL. */
export function fileFormat(product: Product): string {
  const name = product.digital?.fileName || product.digital?.fileUrl || "";
  const m = /\.([a-z0-9]{2,5})(?:[?#].*)?$/i.exec(name);
  return m ? m[1].toUpperCase() : "";
}

/** Label/value rows for the "Product details" table, different for physical and digital products. */
export function productSpecRows(product: Product, t: Dictionary): SpecRow[] {
  const p = t.product;
  const rows: SpecRow[] = [];
  if (product.brand) rows.push({ label: p.brand, value: product.brand });
  if (product.collection) rows.push({ label: p.collection, value: product.collection });

  if (isDigital(product)) {
    const d = product.digital ?? {};
    const format = fileFormat(product);
    if (format) rows.push({ label: p.format, value: format });
    if (d.fileSizeBytes) rows.push({ label: p.fileSize, value: formatFileSize(d.fileSizeBytes) });
    rows.push({ label: p.downloads, value: d.downloadLimit ? fmt(p.downloadsLimit, { n: d.downloadLimit }) : p.downloadsUnlimited });
    rows.push({ label: p.access, value: d.downloadExpiryDays ? fmt(p.accessDays, { n: d.downloadExpiryDays }) : p.accessLifetime });
    rows.push({ label: p.delivery, value: p.instantDownload });
    return rows;
  }

  if (product.sku) rows.push({ label: p.sku, value: product.sku });
  const weight = formatWeight(product.weightGrams);
  if (weight) rows.push({ label: p.weight, value: weight });
  const dims = formatDimensions(product.dimensionsCm);
  if (dims) rows.push({ label: p.dimensions, value: dims });
  rows.push({ label: p.delivery, value: product.shippingRequired === false ? p.noShipping : p.freeDelivery });
  return rows;
}

export type VideoEmbed = { kind: "iframe" | "file"; src: string };

/** YouTube / Vimeo links become player embeds; anything else is played as a video file. */
export function videoEmbed(url?: string): VideoEmbed | null {
  if (!url) return null;
  const yt = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/i.exec(url);
  if (yt) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${yt[1]}` };
  const vimeo = /vimeo\.com\/(?:video\/)?(\d+)/i.exec(url);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };
  return { kind: "file", src: url };
}

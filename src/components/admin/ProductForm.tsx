"use client";

import { useMemo, useState } from "react";
import { buildCategoryTree, flattenTree } from "@/lib/category-tree";
import { PRODUCT_LAYOUTS } from "@/lib/product-layouts";
import { discountPercent, formatFileSize, DEFAULT_LOW_STOCK_THRESHOLD } from "@/lib/product-utils";
import { slugify } from "@/lib/product-input";
import type { Product, Category, ProductLayout } from "@/lib/types";
import ProductImageUploader from "@/components/ProductImageUploader";
import RichTextEditor from "@/components/RichTextEditor";
import FileUploadField, { type UploadedFile } from "@/components/FileUploadField";

const JSON_HEADERS = { "Content-Type": "application/json" };

type ProductType = "physical" | "digital";

type FormState = {
  type: ProductType;
  name: string;
  description: string;
  images: string[];
  video: UploadedFile | null;
  categoryId: string;
  collection: string;
  brand: string;
  price: string;
  compareAtPrice: string;
  sku: string;
  barcode: string;
  stock: string;
  lowStockThreshold: string;
  weightGrams: string;
  length: string;
  width: string;
  height: string;
  shippingRequired: boolean;
  digitalFile: UploadedFile | null;
  downloadLimit: string;
  downloadExpiryDays: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  layout: ProductLayout;
};

const s = (v: number | string | undefined | null) => (v === undefined || v === null ? "" : String(v));

function fromProduct(p: Product | undefined, defaultType: ProductType): FormState {
  return {
    type: p?.type === "digital" ? "digital" : p ? "physical" : defaultType,
    name: p?.name ?? "",
    description: p?.description ?? "",
    images: p?.images ?? [],
    video: p?.videoUrl ? { url: p.videoUrl, name: p.videoUrl.split("/").pop() } : null,
    categoryId: p?.categoryId ?? "",
    collection: p?.collection ?? "",
    brand: p?.brand ?? "",
    price: s(p?.price),
    compareAtPrice: s(p?.compareAtPrice),
    sku: p?.sku ?? "",
    barcode: p?.barcode ?? "",
    stock: s(p?.stock),
    lowStockThreshold: s(p?.lowStockThreshold),
    weightGrams: s(p?.weightGrams),
    length: s(p?.dimensionsCm?.length),
    width: s(p?.dimensionsCm?.width),
    height: s(p?.dimensionsCm?.height),
    shippingRequired: p?.shippingRequired ?? true,
    digitalFile: p?.digital?.fileUrl ? { url: p.digital.fileUrl, name: p.digital.fileName, size: p.digital.fileSizeBytes } : null,
    downloadLimit: s(p?.digital?.downloadLimit),
    downloadExpiryDays: s(p?.digital?.downloadExpiryDays),
    seoTitle: p?.seo?.title ?? "",
    seoDescription: p?.seo?.description ?? "",
    slug: p?.slug ?? "",
    layout: p?.layout ?? "default",
  };
}

/** Tiny wireframe of each product page layout for the picker. */
function LayoutSketch({ layout }: { layout: ProductLayout }) {
  const box = "rounded-sm bg-gray-300";
  if (layout === "amazon") {
    return (
      <div className="h-14 grid grid-cols-12 gap-1 p-1 bg-white border border-gray-200 rounded">
        <div className={`col-span-5 ${box}`} />
        <div className="col-span-4 flex flex-col gap-1">
          <div className={`h-2 ${box}`} />
          <div className="h-1.5 w-2/3 rounded-sm bg-[#CC0C39]" />
          <div className={`h-1 ${box}`} />
        </div>
        <div className="col-span-3 border border-gray-300 rounded p-1 flex flex-col gap-1">
          <div className="h-1.5 rounded-full bg-[#FFD814]" />
          <div className="h-1.5 rounded-full bg-[#FFA41C]" />
        </div>
      </div>
    );
  }
  if (layout === "flipkart") {
    return (
      <div className="h-14 grid grid-cols-12 gap-1 p-1 bg-[#f1f3f6] border border-gray-200 rounded">
        <div className="col-span-5 flex flex-col gap-1">
          <div className="flex-1 bg-white border border-gray-300 rounded-sm" />
          <div className="flex gap-1">
            <div className="flex-1 h-2 bg-[#ff9f00]" />
            <div className="flex-1 h-2 bg-[#fb641b]" />
          </div>
        </div>
        <div className="col-span-7 bg-white p-1 flex flex-col gap-1">
          <div className={`h-1.5 w-3/4 ${box}`} />
          <div className="h-1.5 w-6 rounded-sm bg-[#388e3c]" />
          <div className={`h-1 ${box}`} />
        </div>
      </div>
    );
  }
  return (
    <div className="h-14 grid grid-cols-2 gap-1 p-1 bg-white border border-gray-200 rounded">
      <div className="rounded-md bg-orange-100" />
      <div className="flex flex-col gap-1">
        <div className={`h-2 ${box}`} />
        <div className={`h-1 w-2/3 ${box}`} />
        <div className="h-2 w-2/3 rounded-full bg-orange-500 mt-auto" />
      </div>
    </div>
  );
}

const input = "border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 w-full";
const label = "text-xs font-medium text-gray-600 mb-1 block";

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-gray-200 pt-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">{title}</h3>
      {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </section>
  );
}

function Field({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className={label}>{title}</span>
      {children}
    </label>
  );
}

export default function ProductForm({
  initial,
  categories,
  defaultType = "physical",
  onSaved,
  onCancel,
}: {
  initial?: Product;
  categories: Category[];
  defaultType?: ProductType;
  onSaved: (product: Product) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => fromProduct(initial, defaultType));
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const flatCategories = useMemo(() => flattenTree(buildCategoryTree(categories)), [categories]);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const price = Number(form.price) || 0;
  const compare = Number(form.compareAtPrice) || 0;
  const discount = discountPercent({ price, compareAtPrice: compare || undefined });
  const effectiveSlug = slugTouched && form.slug ? slugify(form.slug) : slugify(form.name);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.categoryId) return setError("Choose a category.");
    if (form.type === "digital" && !form.digitalFile) return setError("Add the digital file customers will download.");

    const payload = {
      type: form.type,
      name: form.name,
      description: form.description,
      images: form.images,
      videoUrl: form.video?.url ?? "",
      categoryId: form.categoryId,
      collection: form.collection,
      brand: form.brand,
      price: form.price,
      compareAtPrice: form.compareAtPrice,
      sku: form.sku,
      barcode: form.barcode,
      stock: form.type === "digital" ? 0 : form.stock,
      lowStockThreshold: form.lowStockThreshold,
      weightGrams: form.weightGrams,
      dimensionsCm: { length: form.length, width: form.width, height: form.height },
      shippingRequired: form.shippingRequired,
      digital: {
        fileUrl: form.digitalFile?.url ?? "",
        fileName: form.digitalFile?.name ?? "",
        fileSizeBytes: form.digitalFile?.size ?? "",
        downloadLimit: form.downloadLimit,
        downloadExpiryDays: form.downloadExpiryDays,
      },
      seo: { title: form.seoTitle, description: form.seoDescription },
      slug: effectiveSlug,
      layout: form.layout,
    };

    setSaving(true);
    try {
      const res = initial
        ? await fetch(`/api/products/${initial.id}`, { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify(payload) })
        : await fetch("/api/products", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save the product.");
        return;
      }
      onSaved(data);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-5 mb-6 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900">{initial ? "Edit Product" : "Add Product"}</h2>
        {initial && <span className="text-xs text-gray-500 font-mono">{initial.id}</span>}
      </div>
      {error && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

      {/* Product type */}
      <div>
        <p className={label}>Product type</p>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          {(
            [
              { id: "physical", title: "Physical", hint: "Shipped to the customer. Has stock, weight, and size." },
              { id: "digital", title: "Digital", hint: "Delivered as a download. No stock or shipping." },
            ] as Array<{ id: ProductType; title: string; hint: string }>
          ).map((opt) => (
            <label
              key={opt.id}
              className={`flex gap-2 border rounded-lg p-3 cursor-pointer ${form.type === opt.id ? "border-orange-500 ring-2 ring-orange-200 bg-orange-50" : "border-gray-200 hover:border-gray-400"}`}
            >
              <input type="radio" name="type" value={opt.id} checked={form.type === opt.id} onChange={() => set("type", opt.id)} className="mt-1 accent-orange-600" />
              <span>
                <span className="block text-sm font-semibold text-gray-900">{opt.title}</span>
                <span className="block text-xs text-gray-500">{opt.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <Section title="Basics">
        <Field title="Product name" className="sm:col-span-2">
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={input} placeholder="e.g. Wireless Earbuds Pro" />
        </Field>
        <div className="sm:col-span-2">
          <span className={label}>Product description</span>
          <RichTextEditor
            value={form.description}
            onChange={(html) => set("description", html)}
            placeholder="What it is, key features, what is in the box. Bullet points become the highlights on Amazon and Flipkart style pages."
          />
        </div>
      </Section>

      <Section title="Media">
        <div className="sm:col-span-2">
          <span className={label}>Product images</span>
          <ProductImageUploader images={form.images} onChange={(images) => set("images", images)} onError={setError} />
        </div>
        <div className="sm:col-span-2">
          <span className={label}>Product video (optional)</span>
          <FileUploadField
            kind="video"
            accept="video/mp4,video/webm"
            hint="MP4 or WebM up to 50 MB, or a link to a hosted video file."
            value={form.video}
            onChange={(v) => set("video", v)}
            onError={setError}
          />
        </div>
      </Section>

      <Section title="Organisation">
        <Field title="Category">
          <select required value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={input}>
            <option value="">Select category…</option>
            {flatCategories.map(({ node, depth }) => (
              <option key={node.id} value={node.id}>
                {"  ".repeat(depth)}
                {depth > 0 ? "└ " : ""}
                {node.name}
                {!node.enabled ? " (hidden)" : ""}
              </option>
            ))}
          </select>
        </Field>
        <Field title="Collection">
          <input value={form.collection} onChange={(e) => set("collection", e.target.value)} className={input} placeholder="e.g. Summer Picks" />
        </Field>
        <Field title="Brand">
          <input value={form.brand} onChange={(e) => set("brand", e.target.value)} className={input} placeholder="e.g. boAt" />
        </Field>
      </Section>

      <Section title="Pricing">
        <Field title="Price (₹)">
          <input required type="number" min={0} step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} className={input} />
        </Field>
        <Field title="Compare-at price (₹)">
          <input type="number" min={0} step="0.01" value={form.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)} className={input} placeholder="Original price, shown struck through" />
        </Field>
        <div>
          <span className={label}>Discount</span>
          <div className={`${input} bg-gray-50 text-gray-700`}>{discount > 0 ? `${discount}% off` : "No discount"}</div>
        </div>
      </Section>

      <Section title="Identifiers">
        <Field title="SKU">
          <input value={form.sku} onChange={(e) => set("sku", e.target.value)} className={input} placeholder="Your internal code" />
        </Field>
        <Field title="Barcode">
          <input value={form.barcode} onChange={(e) => set("barcode", e.target.value)} className={input} placeholder="EAN / UPC / ISBN" />
        </Field>
      </Section>

      {form.type === "physical" ? (
        <Section title="Physical product">
          <Field title="Stock quantity">
            <input required type="number" min={0} step={1} value={form.stock} onChange={(e) => set("stock", e.target.value)} className={input} />
          </Field>
          <Field title="Low-stock threshold">
            <input type="number" min={0} step={1} value={form.lowStockThreshold} onChange={(e) => set("lowStockThreshold", e.target.value)} className={input} placeholder={`Store default: ${DEFAULT_LOW_STOCK_THRESHOLD}`} />
          </Field>
          <Field title="Weight (grams)">
            <input type="number" min={0} step={1} value={form.weightGrams} onChange={(e) => set("weightGrams", e.target.value)} className={input} />
          </Field>
          <div>
            <span className={label}>Dimensions (cm, L × W × H)</span>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" min={0} step="0.1" value={form.length} onChange={(e) => set("length", e.target.value)} className={input} placeholder="L" aria-label="Length" />
              <input type="number" min={0} step="0.1" value={form.width} onChange={(e) => set("width", e.target.value)} className={input} placeholder="W" aria-label="Width" />
              <input type="number" min={0} step="0.1" value={form.height} onChange={(e) => set("height", e.target.value)} className={input} placeholder="H" aria-label="Height" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
            <input type="checkbox" checked={form.shippingRequired} onChange={(e) => set("shippingRequired", e.target.checked)} className="accent-orange-600" />
            Shipping required
          </label>
        </Section>
      ) : (
        <Section title="Digital product" hint="The file is delivered to the customer after purchase.">
          <div className="sm:col-span-2">
            <span className={label}>Digital file</span>
            <FileUploadField
              kind="file"
              accept=".pdf,.zip,.epub,.mp3,.mp4,.jpg,.jpeg,.png,.webp,.txt"
              hint="PDF, ZIP, EPUB, MP3, MP4, or image up to 50 MB, or a link to the file."
              value={form.digitalFile}
              onChange={(v) => set("digitalFile", v)}
              onError={setError}
            />
          </div>
          <Field title="Download limit">
            <input type="number" min={0} step={1} value={form.downloadLimit} onChange={(e) => set("downloadLimit", e.target.value)} className={input} placeholder="Times a buyer may download; blank = unlimited" />
          </Field>
          <Field title="Download expiry (days)">
            <input type="number" min={0} step={1} value={form.downloadExpiryDays} onChange={(e) => set("downloadExpiryDays", e.target.value)} className={input} placeholder="Blank = never expires" />
          </Field>
          <div>
            <span className={label}>File size</span>
            <div className={`${input} bg-gray-50 text-gray-700`}>{form.digitalFile?.size ? formatFileSize(form.digitalFile.size) : "Filled in when a file is uploaded"}</div>
          </div>
        </Section>
      )}

      <Section title="Display" hint="How the product page looks.">
        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRODUCT_LAYOUTS.map((option) => {
            const selected = form.layout === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => set("layout", option.id)}
                className={`text-left border rounded-lg p-3 transition-colors ${selected ? "border-orange-500 ring-2 ring-orange-200 bg-orange-50" : "border-gray-200 hover:border-gray-400 bg-white"}`}
              >
                <LayoutSketch layout={option.id} />
                <p className="mt-2 text-sm font-semibold text-gray-900">{option.name}</p>
                <p className="text-xs text-gray-500 leading-snug">{option.tagline}</p>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="SEO" hint="How the product appears in search engines and the browser tab.">
        <Field title="Page title" className="sm:col-span-2">
          <input maxLength={70} value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className={input} placeholder={form.name ? `${form.name} | anyitems.in` : "Defaults to the product name"} />
        </Field>
        <Field title="Meta description" className="sm:col-span-2">
          <textarea maxLength={160} rows={2} value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} className={input} placeholder="Defaults to the start of the description" />
          <span className="text-xs text-gray-400">{form.seoDescription.length}/160</span>
        </Field>
        <Field title="URL" className="sm:col-span-2">
          <div className="flex items-center">
            <span className="text-sm text-gray-500 border border-r-0 border-gray-300 rounded-l-md px-3 py-2 bg-gray-50 whitespace-nowrap">/products/</span>
            <input
              value={slugTouched ? form.slug : effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
              className={`${input} rounded-l-none`}
              placeholder="made-from-the-name"
            />
          </div>
          <span className="text-xs text-gray-400">Lowercase letters, numbers, and hyphens. A number is added if the address is already taken.</span>
        </Field>
      </Section>

      <div className="flex gap-3 border-t border-gray-200 pt-5">
        <button type="submit" disabled={saving} className="bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-md hover:bg-orange-700 text-sm disabled:opacity-50">
          {saving ? "Saving…" : "Save Product"}
        </button>
        <button type="button" onClick={onCancel} className="border border-gray-300 text-gray-700 font-medium px-4 py-2.5 rounded-md hover:bg-gray-50 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

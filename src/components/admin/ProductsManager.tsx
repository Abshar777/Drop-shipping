"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import { buildCategoryTree, categoryPath, flattenTree } from "@/lib/category-tree";
import { PRODUCT_LAYOUTS } from "@/lib/product-layouts";
import type { Product, Category, ProductLayout } from "@/lib/types";
import ProductImageUploader from "@/components/ProductImageUploader";
import RichTextEditor from "@/components/RichTextEditor";
import { PageHeader } from "./ui";

const JSON_HEADERS = { "Content-Type": "application/json" };

type ProductType = "physical" | "digital";

const EMPTY_FORM = {
  name: "",
  categoryId: "",
  price: "",
  compareAtPrice: "",
  stock: "",
  description: "",
  images: [] as string[],
  layout: "default" as ProductLayout,
  type: "physical" as ProductType,
};

/** Tiny wireframe of each product page layout for the picker. */
function LayoutSketch({ layout }: { layout: ProductLayout }) {
  const box = "rounded-sm bg-gray-300";
  if (layout === "amazon") {
    return (
      <div className="h-16 grid grid-cols-12 gap-1 p-1 bg-white border border-gray-200 rounded">
        <div className={`col-span-5 ${box}`} />
        <div className="col-span-4 flex flex-col gap-1">
          <div className={`h-2 ${box}`} />
          <div className="h-1.5 w-2/3 rounded-sm bg-[#CC0C39]" />
          <div className={`h-1 ${box}`} />
          <div className={`h-1 ${box}`} />
        </div>
        <div className="col-span-3 border border-gray-300 rounded p-1 flex flex-col gap-1">
          <div className={`h-1.5 ${box}`} />
          <div className="h-1.5 rounded-full bg-[#FFD814]" />
          <div className="h-1.5 rounded-full bg-[#FFA41C]" />
        </div>
      </div>
    );
  }
  if (layout === "flipkart") {
    return (
      <div className="h-16 grid grid-cols-12 gap-1 p-1 bg-[#f1f3f6] border border-gray-200 rounded">
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
          <div className={`h-1 w-2/3 ${box}`} />
        </div>
      </div>
    );
  }
  return (
    <div className="h-16 grid grid-cols-2 gap-1 p-1 bg-white border border-gray-200 rounded">
      <div className="rounded-md bg-orange-100" />
      <div className="flex flex-col gap-1">
        <div className={`h-2 ${box}`} />
        <div className={`h-1 w-2/3 ${box}`} />
        <div className={`h-1 ${box}`} />
        <div className="h-2 w-2/3 rounded-full bg-orange-500 mt-auto" />
      </div>
    </div>
  );
}

export default function ProductsManager({
  typeFilter,
  openForm = false,
}: {
  typeFilter?: ProductType;
  openForm?: boolean;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM, type: typeFilter ?? "physical" });
  const [showForm, setShowForm] = useState(openForm);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");

  function fetchAll() {
    return Promise.all([fetch("/api/products").then((r) => r.json()), fetch("/api/categories?all=1").then((r) => r.json())]).then(
      ([p, c]) => {
        setProducts(Array.isArray(p) ? p : []);
        setCategories(Array.isArray(c.categories) ? c.categories : []);
        setLoading(false);
      }
    );
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const flatAll = useMemo(() => flattenTree(buildCategoryTree(categories)), [categories]);
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const pathLabel = (id: string) => categoryPath(categories, id).map((c) => c.name).join(" › ");

  const rows = products.filter((p) => {
    const type: ProductType = p.type === "digital" ? "digital" : "physical";
    if (typeFilter && type !== typeFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function startAdd() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, type: typeFilter ?? "physical" });
    setFormError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    const fallbackId = categories.find((c) => !c.parentId && c.name === product.category)?.id ?? "";
    setForm({
      name: product.name,
      categoryId: product.categoryId ?? fallbackId,
      price: String(product.price),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      stock: String(product.stock),
      description: product.description,
      images: product.images,
      layout: product.layout ?? "default",
      type: product.type === "digital" ? "digital" : "physical",
    });
    setFormError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchAll();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const payload = {
      name: form.name,
      categoryId: form.categoryId,
      price: form.price,
      compareAtPrice: form.compareAtPrice || undefined,
      stock: form.stock,
      description: form.description,
      images: form.images,
      layout: form.layout,
      type: form.type,
    };
    const res = editingId
      ? await fetch(`/api/products/${editingId}`, { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify(payload) })
      : await fetch("/api/products", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(payload) });
    if (!res.ok) {
      setFormError((await res.json()).error || "Something went wrong");
      return;
    }
    setShowForm(false);
    fetchAll();
  }

  const title = openForm ? "Add Product" : typeFilter === "digital" ? "Digital Products" : typeFilter === "physical" ? "Physical Products" : "All Products";
  const inputClass = "border border-gray-300 rounded-md px-3 py-2 text-sm bg-white";

  return (
    <div>
      <PageHeader
        title={title}
        description={`${rows.length} product${rows.length === 1 ? "" : "s"}`}
        action={
          !showForm && (
            <button onClick={startAdd} className="bg-orange-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-orange-700 text-sm">
              + Add Product
            </button>
          )
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <h2 className="sm:col-span-2 font-bold text-gray-900">{editingId ? "Edit Product" : "New Product"}</h2>
          {formError && (
            <p className="sm:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{formError}</p>
          )}
          <input required placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${inputClass} sm:col-span-2`} />
          <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputClass}>
            <option value="">Select category…</option>
            {flatAll.map(({ node, depth }) => (
              <option key={node.id} value={node.id}>
                {"  ".repeat(depth)}
                {depth > 0 ? "└ " : ""}
                {node.name}
                {!node.enabled ? " (hidden)" : ""}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-4 text-sm text-gray-700">
            <span className="font-medium">Type</span>
            {(["physical", "digital"] as ProductType[]).map((t) => (
              <label key={t} className="flex items-center gap-1.5 capitalize">
                <input type="radio" name="type" value={t} checked={form.type === t} onChange={() => setForm({ ...form, type: t })} />
                {t}
              </label>
            ))}
          </div>
          <input required type="number" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} />
          <input type="number" placeholder="Compare-at price (₹, optional)" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} className={inputClass} />
          <input required type="number" placeholder="Stock quantity" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputClass} />
          <div className="sm:col-span-2">
            <p className="text-sm font-medium text-gray-700 mb-1.5">Images</p>
            <ProductImageUploader images={form.images} onChange={(images) => setForm((f) => ({ ...f, images }))} onError={setFormError} />
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-baseline justify-between mb-1.5">
              <p className="text-sm font-medium text-gray-700">Description</p>
              <span className="text-xs text-gray-400">Select text, then use the toolbar for bold, headings, lists, and size</span>
            </div>
            <RichTextEditor
              value={form.description}
              onChange={(html) => setForm((f) => ({ ...f, description: html }))}
              placeholder="Describe the product: what it is, key features, sizes or colours, what is in the box. Bullet points become the highlights on Amazon and Flipkart style pages."
            />
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm font-medium text-gray-700 mb-1.5">Product page style</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PRODUCT_LAYOUTS.map((option) => {
                const selected = form.layout === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, layout: option.id }))}
                    className={`text-left border rounded-lg p-3 transition-colors ${
                      selected ? "border-orange-500 ring-2 ring-orange-200 bg-orange-50" : "border-gray-200 hover:border-gray-400 bg-white"
                    }`}
                  >
                    <LayoutSketch layout={option.id} />
                    <p className="mt-2 text-sm font-semibold text-gray-900">{option.name}</p>
                    <p className="text-xs text-gray-500 leading-snug">{option.tagline}</p>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" className="bg-orange-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-orange-700 text-sm">
              {editingId ? "Save Changes" : "Create Product"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md hover:bg-gray-50 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mb-3">
        <input type="search" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputClass} w-full sm:w-72`} />
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-10 text-center text-sm text-gray-500">No products here yet.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Stock</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded bg-gray-100" />
                      <span className="line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{p.categoryId && categoryById.has(p.categoryId) ? pathLabel(p.categoryId) : p.category}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.type === "digital" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                      {p.type === "digital" ? "Digital" : "Physical"}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-medium">{formatPrice(p.price)}</td>
                  <td className={`px-4 py-2 ${p.stock === 0 ? "text-red-600 font-medium" : p.stock <= 5 ? "text-amber-600 font-medium" : ""}`}>{p.stock}</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <button onClick={() => startEdit(p)} className="text-orange-600 hover:underline mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

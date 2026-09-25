"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import { categoryPath } from "@/lib/category-tree";
import { isDigital, isLowStock } from "@/lib/product-utils";
import type { Product, Category } from "@/lib/types";
import ProductForm from "./ProductForm";
import { PageHeader } from "./ui";

type ProductType = "physical" | "digital";

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
  const [editing, setEditing] = useState<Product | undefined>(undefined);
  const [showForm, setShowForm] = useState(openForm);
  const [formKey, setFormKey] = useState(0);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

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

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const pathLabel = (id: string) => categoryPath(categories, id).map((c) => c.name).join(" › ");

  const rows = products.filter((p) => {
    const type: ProductType = isDigital(p) ? "digital" : "physical";
    if (typeFilter && type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.sku ?? "").toLowerCase().includes(q) && !(p.brand ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  function startAdd() {
    setEditing(undefined);
    setFormKey((k) => k + 1);
    setShowForm(true);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startEdit(product: Product) {
    setEditing(product);
    setFormKey((k) => k + 1);
    setShowForm(true);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete "${product.name}"?`)) return;
    await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    fetchAll();
  }

  const title = openForm ? "Add Product" : typeFilter === "digital" ? "Digital Products" : typeFilter === "physical" ? "Physical Products" : "All Products";

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

      {notice && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-4">{notice}</p>}

      {showForm && (
        <ProductForm
          key={formKey}
          initial={editing}
          categories={categories}
          defaultType={typeFilter ?? "physical"}
          onSaved={(p) => {
            setShowForm(false);
            setNotice(`Saved "${p.name}". It is live at /products/${p.slug}.`);
            fetchAll();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="mb-3">
        <input type="search" placeholder="Search by name, SKU, or brand…" value={search} onChange={(e) => setSearch(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white w-full sm:w-80" />
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
                      <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded bg-gray-100" />
                      <div className="min-w-0">
                        <div className="line-clamp-1 text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-500">
                          {[p.brand, p.sku ? `SKU ${p.sku}` : null].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{p.categoryId && categoryById.has(p.categoryId) ? pathLabel(p.categoryId) : p.category}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isDigital(p) ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                      {isDigital(p) ? "Digital" : "Physical"}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-medium">{formatPrice(p.price)}</td>
                  <td className={`px-4 py-2 ${isDigital(p) ? "text-gray-400" : p.stock === 0 ? "text-red-600 font-medium" : isLowStock(p) ? "text-amber-600 font-medium" : ""}`}>
                    {isDigital(p) ? "∞" : p.stock}
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <button onClick={() => startEdit(p)} className="text-orange-600 hover:underline mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p)} className="text-red-600 hover:underline">
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

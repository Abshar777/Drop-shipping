"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { buildCategoryTree, categoryPath, flattenTree, type CategoryNode } from "@/lib/category-tree";
import { CATEGORY_ICONS, guessCategoryIcon, isCategoryIcon, resolveCategoryIcon } from "@/lib/category-icons";
import CategoryIcon from "@/components/CategoryIcon";
import ThemeSettings from "@/components/ThemeSettings";
import AdminUsers from "@/components/AdminUsers";
import type { Product, Order, Category } from "@/lib/types";

const EMPTY_FORM = {
  name: "",
  categoryId: "",
  price: "",
  compareAtPrice: "",
  stock: "",
  description: "",
  images: "",
};

type Tab = "products" | "categories" | "orders" | "theme" | "admins";

const JSON_HEADERS = { "Content-Type": "application/json" };

const SOURCE_LABEL: Record<string, string> = { store: "Store", meesho: "Meesho", noon: "noon" };

export default function AdminDashboard({ adminId, adminName }: { adminId: string; adminName: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("products");

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [categorySearch, setCategorySearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "store" | "meesho" | "noon">("all");
  const [onlyEnabled, setOnlyEnabled] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Fetchers only touch state inside their callbacks, so they are safe to call from the initial effect.
  function fetchProducts() {
    return fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setProductsLoading(false);
      });
  }

  function fetchCategories() {
    return fetch("/api/categories?all=1")
      .then((res) => res.json())
      .then((data) => {
        setCategories(Array.isArray(data.categories) ? data.categories : []);
        setCategoriesLoading(false);
      });
  }

  function fetchOrders() {
    return fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setOrdersLoading(false);
      });
  }

  // Reloads after a mutation show the spinner first.
  function loadProducts() {
    setProductsLoading(true);
    fetchProducts();
  }

  function loadCategories() {
    fetchCategories();
  }

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchOrders();
  }, []);

  // ---- derived category views -------------------------------------------------
  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const flatAll = useMemo(() => flattenTree(tree), [tree]);
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const productCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const key = p.categoryId ?? categories.find((c) => !c.parentId && c.name === p.category)?.id;
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [products, categories]);

  const enabledCount = categories.filter((c) => c.enabled).length;

  /** Rows to render in the Categories tab: a tree when browsing, a flat match list when searching. */
  const categoryRows = useMemo(() => {
    const term = categorySearch.trim().toLowerCase();
    const matchesFilters = (c: Category) =>
      (sourceFilter === "all" || (c.source ?? "store") === sourceFilter) && (!onlyEnabled || c.enabled);

    if (term) {
      return flatAll
        .filter(({ node }) => node.name.toLowerCase().includes(term) && matchesFilters(node))
        .map(({ node }) => ({ node, depth: 0, showPath: true }));
    }

    const out: Array<{ node: CategoryNode; depth: number; showPath: boolean }> = [];
    const walk = (nodes: CategoryNode[], depth: number) => {
      for (const node of nodes) {
        // Keep a parent visible if any descendant passes the filter, so the tree stays navigable.
        const subtree = flattenTree([node]).map((r) => r.node);
        if (!subtree.some(matchesFilters)) continue;
        out.push({ node, depth, showPath: false });
        if (expanded.has(node.id)) walk(node.children, depth + 1);
      }
    };
    walk(tree, 0);
    return out;
  }, [flatAll, tree, categorySearch, sourceFilter, onlyEnabled, expanded]);

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function expandAll() {
    setExpanded(new Set(categories.filter((c) => categories.some((x) => x.parentId === c.id)).map((c) => c.id)));
  }

  function pathLabel(id: string) {
    return categoryPath(categories, id)
      .map((c) => c.name)
      .join(" › ");
  }

  function hiddenByAncestor(id: string) {
    const chain = categoryPath(categories, id);
    return chain.slice(0, -1).some((c) => !c.enabled);
  }

  // ---- category actions -------------------------------------------------------
  async function patchCategory(id: string, body: Record<string, unknown>) {
    setCategoryError("");
    setBusyId(id);
    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
    });
    if (!res.ok) setCategoryError((await res.json()).error || "Something went wrong");
    setBusyId(null);
    loadCategories();
  }

  async function addCategory(parentId: string | null) {
    const label = parentId ? `New subcategory under "${categoryById.get(parentId)?.name}"` : "New top-level category";
    const name = prompt(label + "\n\nName:");
    if (!name || !name.trim()) return;
    setCategoryError("");
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ name: name.trim(), parentId }),
    });
    if (!res.ok) setCategoryError((await res.json()).error || "Something went wrong");
    else if (parentId) setExpanded((prev) => new Set(prev).add(parentId));
    loadCategories();
  }

  async function renameCategory(c: Category) {
    const name = prompt("Rename category:", c.name);
    if (!name || !name.trim() || name.trim() === c.name) return;
    await patchCategory(c.id, { name: name.trim() });
  }

  async function deleteCategory(c: Category) {
    const kids = categories.filter((x) => x.parentId === c.id).length;
    const msg = kids
      ? `Delete "${c.name}" and all of its subcategories?`
      : `Delete "${c.name}"?`;
    if (!confirm(msg)) return;
    setCategoryError("");
    setBusyId(c.id);
    const res = await fetch(`/api/categories/${c.id}`, { method: "DELETE" });
    if (!res.ok) setCategoryError((await res.json()).error || "Something went wrong");
    setBusyId(null);
    loadCategories();
  }

  // ---- product actions --------------------------------------------------------
  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function startAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowForm(true);
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
      images: product.images.join(", "),
    });
    setFormError("");
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    loadProducts();
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
      images: form.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    const res = editingId
      ? await fetch(`/api/products/${editingId}`, { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify(payload) })
      : await fetch("/api/products", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(payload) });

    if (!res.ok) {
      setFormError((await res.json()).error || "Something went wrong");
      return;
    }
    setShowForm(false);
    loadProducts();
  }

  const tabButton = (key: Tab, label: string, badge?: string) => (
    <button
      onClick={() => setTab(key)}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center gap-2 ${
        tab === key ? "border-orange-600 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}
      {badge && <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{badge}</span>}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Signed in as {adminName}</p>
        </div>
        <button
          onClick={handleLogout}
          className="border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md hover:bg-gray-50 text-sm"
        >
          Log Out
        </button>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabButton("products", "Products", String(products.length))}
        {tabButton("categories", "Categories", `${enabledCount} / ${categories.length} on`)}
        {tabButton("orders", "Orders", String(orders.length))}
        {tabButton("theme", "Theme")}
        {tabButton("admins", "Admins")}
      </div>

      {/* ------------------------------------------------------------------ */}
      {tab === "products" && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={startAdd}
              className="bg-orange-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-orange-700 text-sm"
            >
              + Add Product
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-gray-200 rounded-lg p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <h2 className="sm:col-span-2 font-bold text-gray-900">
                {editingId ? "Edit Product" : "New Product"}
              </h2>
              {formError && (
                <p className="sm:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {formError}
                </p>
              )}
              <input
                required
                placeholder="Product name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm sm:col-span-2"
              />
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
              >
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
              <input
                required
                type="number"
                placeholder="Price (₹)"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Compare-at price (₹, optional)"
                value={form.compareAtPrice}
                onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                required
                type="number"
                placeholder="Stock quantity"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                placeholder="Image URLs (comma-separated)"
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm sm:col-span-2"
              />
              <textarea
                placeholder="Description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm sm:col-span-2"
              />
              <div className="sm:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="bg-orange-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-orange-700 text-sm"
                >
                  {editingId ? "Save Changes" : "Create Product"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {productsLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-500">
                  <tr>
                    <th className="px-4 py-2">Product</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Price</th>
                    <th className="px-4 py-2">Stock</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t border-gray-100">
                      <td className="px-4 py-2 flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded" />
                        <span className="line-clamp-1">{p.name}</span>
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {p.categoryId && categoryById.has(p.categoryId) ? pathLabel(p.categoryId) : p.category}
                      </td>
                      <td className="px-4 py-2 font-medium">{formatPrice(p.price)}</td>
                      <td className="px-4 py-2">{p.stock}</td>
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
      )}

      {/* ------------------------------------------------------------------ */}
      {tab === "categories" && (
        <div>
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
            <input
              type="search"
              placeholder="Search categories…"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm md:w-64"
            />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="all">All sources</option>
              <option value="store">Store</option>
              <option value="meesho">Meesho</option>
              <option value="noon">noon</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={onlyEnabled} onChange={(e) => setOnlyEnabled(e.target.checked)} />
              Enabled only
            </label>
            <div className="flex-1" />
            <button onClick={expandAll} className="text-sm text-gray-600 hover:text-orange-600">
              Expand all
            </button>
            <button onClick={() => setExpanded(new Set())} className="text-sm text-gray-600 hover:text-orange-600">
              Collapse all
            </button>
            <button
              onClick={() => addCategory(null)}
              className="bg-orange-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-orange-700 text-sm"
            >
              + Add Category
            </button>
          </div>

          <p className="text-xs text-gray-500 mb-3">
            Enabled categories appear in the storefront menu, the home page, and the product filter. A subcategory
            only shows if every parent above it is enabled too. Use <span className="font-medium">All on / All off</span>{" "}
            to switch a whole branch at once.
          </p>

          {categoryError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">
              {categoryError}
            </p>
          )}

          {categoriesLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : categoryRows.length === 0 ? (
            <p className="text-gray-500">No categories match.</p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-500">
                  <tr>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-3 py-2">Icon</th>
                    <th className="px-3 py-2 whitespace-nowrap">Products</th>
                    <th className="px-3 py-2">Source</th>
                    <th className="px-3 py-2">Visible</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {categoryRows.map(({ node, depth, showPath }) => {
                    const kids = node.children.length;
                    const open = expanded.has(node.id);
                    const busy = busyId === node.id;
                    const shadowed = node.enabled && hiddenByAncestor(node.id);
                    return (
                      <tr key={node.id} className={`border-t border-gray-100 ${busy ? "opacity-50" : ""}`}>
                        <td className="px-4 py-1.5">
                          <div className="flex items-center gap-1" style={{ paddingLeft: `${depth * 1.25}rem` }}>
                            {kids > 0 && !showPath ? (
                              <button
                                onClick={() => toggleExpanded(node.id)}
                                className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 shrink-0"
                                aria-label={open ? "Collapse" : "Expand"}
                              >
                                {open ? "▾" : "▸"}
                              </button>
                            ) : (
                              <span className="w-5 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <span className={`${depth === 0 && !showPath ? "font-semibold text-gray-900" : "text-gray-800"}`}>
                                {node.name}
                              </span>
                              {kids > 0 && (
                                <span className="ml-2 text-xs text-gray-400">{kids} sub</span>
                              )}
                              {showPath && (
                                <div className="text-xs text-gray-400 truncate">{pathLabel(node.id)}</div>
                              )}
                              {shadowed && (
                                <div className="text-xs text-amber-600">Hidden because a parent category is off</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-1.5">
                          {!node.parentId && (
                            <div className="flex items-center gap-1.5">
                              <CategoryIcon name={resolveCategoryIcon(node)} className="w-7 h-7 text-gray-700 shrink-0" />
                              <select
                                value={isCategoryIcon(node.icon) ? node.icon : ""}
                                onChange={(e) => patchCategory(node.id, { icon: e.target.value })}
                                disabled={busy}
                                className="border border-gray-300 rounded px-1 py-0.5 text-xs bg-white"
                                title="Icon shown in the category bar"
                              >
                                <option value="">Auto ({guessCategoryIcon(node.name)})</option>
                                {CATEGORY_ICONS.map((icon) => (
                                  <option key={icon} value={icon}>
                                    {icon}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-1.5 text-gray-600 text-center">{productCount.get(node.id) ?? ""}</td>
                        <td className="px-3 py-1.5">
                          <span className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">
                            {SOURCE_LABEL[node.source ?? "store"]}
                          </span>
                        </td>
                        <td className="px-3 py-1.5">
                          <button
                            onClick={() => patchCategory(node.id, { enabled: !node.enabled })}
                            disabled={busy}
                            role="switch"
                            aria-checked={node.enabled}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              node.enabled ? "bg-green-500" : "bg-gray-300"
                            }`}
                            title={node.enabled ? "Visible on storefront. Click to hide." : "Hidden. Click to show."}
                          >
                            <span
                              className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                                node.enabled ? "translate-x-4" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-3 py-1.5 text-right whitespace-nowrap text-xs">
                          {kids > 0 && (
                            <>
                              <button
                                onClick={() => patchCategory(node.id, { enabled: true, cascade: true })}
                                className="text-green-700 hover:underline mr-2"
                                title="Enable this category and everything under it"
                              >
                                All on
                              </button>
                              <button
                                onClick={() => patchCategory(node.id, { enabled: false, cascade: true })}
                                className="text-gray-500 hover:underline mr-2"
                                title="Disable this category and everything under it"
                              >
                                All off
                              </button>
                            </>
                          )}
                          <button onClick={() => addCategory(node.id)} className="text-orange-600 hover:underline mr-2">
                            + Sub
                          </button>
                          <button onClick={() => renameCategory(node)} className="text-gray-600 hover:underline mr-2">
                            Rename
                          </button>
                          <button onClick={() => deleteCategory(node)} className="text-red-600 hover:underline">
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {tab === "theme" && <ThemeSettings />}

      {tab === "admins" && <AdminUsers currentAdminId={adminId} />}

      {tab === "orders" && (
        <div>
          {ordersLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-500">No orders yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-mono text-sm text-gray-500">{order.id}</p>
                      <p className="font-semibold text-gray-900">{order.customerName}</p>
                      <p className="text-sm text-gray-500">
                        {order.email} · {order.phone}
                      </p>
                    </div>
                    <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full capitalize">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {order.address}, {order.city}, {order.state} - {order.pincode}
                  </p>
                  <div className="flex flex-col gap-1 mb-3">
                    {order.items.map((item) => {
                      const product = products.find((p) => p.id === item.productId);
                      return (
                        <div key={item.productId} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {product?.name || "Unknown product"} × {item.quantity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                    <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleString("en-IN")}
                    </span>
                    <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

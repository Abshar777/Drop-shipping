"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import type { Product, Order } from "@/lib/types";

const EMPTY_FORM = {
  name: "",
  category: "",
  price: "",
  compareAtPrice: "",
  stock: "",
  description: "",
  images: "",
};

type Tab = "products" | "orders";

export default function AdminDashboard({ adminName }: { adminName: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("products");

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  function loadProducts() {
    setProductsLoading(true);
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setProductsLoading(false);
      });
  }

  function loadOrders() {
    setOrdersLoading(true);
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setOrdersLoading(false);
      });
  }

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function startAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      stock: String(product.stock),
      description: product.description,
      images: product.images.join(", "),
    });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    loadProducts();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      category: form.category,
      price: form.price,
      compareAtPrice: form.compareAtPrice || undefined,
      stock: form.stock,
      description: form.description,
      images: form.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    if (editingId) {
      await fetch(`/api/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setShowForm(false);
    loadProducts();
  }

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
        <button
          onClick={() => setTab("products")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === "products" ? "border-orange-600 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === "orders" ? "border-orange-600 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Orders
        </button>
      </div>

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
              <input
                required
                placeholder="Product name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm sm:col-span-2"
              />
              <input
                required
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
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
                      <td className="px-4 py-2 text-gray-600">{p.category}</td>
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

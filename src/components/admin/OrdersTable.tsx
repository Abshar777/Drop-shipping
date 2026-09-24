"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUSES, type Order, type OrderStatus, type Product } from "@/lib/types";
import { PageHeader, StatusBadge, formatDate } from "./ui";

const JSON_HEADERS = { "Content-Type": "application/json" };

type View = "orders" | "shipping";

const TITLES: Record<View, Record<string, string>> = {
  orders: {
    all: "All Orders",
    pending: "Pending Orders",
    processing: "Processing Orders",
    shipped: "Shipped Orders",
    delivered: "Delivered Orders",
    cancelled: "Cancelled Orders",
    refunded: "Refunded Orders",
  },
  shipping: {
    all: "Shipping Orders",
    pending: "Pending Shipment",
    shipped: "Shipped",
    delivered: "Delivered",
  },
};

function matches(view: View, status: string, order: Order) {
  if (view === "shipping") {
    if (status === "pending") return order.status === "pending" || order.status === "processing";
    if (status === "shipped" || status === "delivered") return order.status === status;
    return order.status !== "cancelled" && order.status !== "refunded";
  }
  return status === "all" || order.status === status;
}

export default function OrdersTable({ status = "all", view = "orders" }: { status?: string; view?: View }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function load() {
    return Promise.all([fetch("/api/orders").then((r) => r.json()), fetch("/api/products").then((r) => r.json())]).then(
      ([o, p]) => {
        setOrders(Array.isArray(o) ? o : []);
        setProducts(Array.isArray(p) ? p : []);
        setLoading(false);
      }
    );
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(order: Order, next: OrderStatus) {
    if (next === order.status) return;
    if ((next === "cancelled" || next === "refunded") && !confirm(`Mark ${order.id} as ${next}? Its stock will be put back.`)) return;
    setBusyId(order.id);
    setError("");
    const res = await fetch(`/api/orders/${order.id}`, { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify({ status: next }) });
    if (!res.ok) setError((await res.json()).error || "Could not update the order");
    await load();
    setBusyId(null);
  }

  const rows = orders.filter((o) => matches(view, status, o)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const title = TITLES[view][status] ?? TITLES[view].all;
  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? "Unknown product";

  return (
    <div>
      <PageHeader
        title={title}
        description={view === "shipping" ? "Orders that need to be packed, shipped, or were delivered." : "Change a status from the dropdown; cancelled and refunded orders release their stock."}
      />
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-10 text-center text-sm text-gray-500">No orders here.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Items</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const open = openId === o.id;
                const units = o.items.reduce((s, i) => s + i.quantity, 0);
                return (
                  <>
                    <tr key={o.id} className={`border-t border-gray-100 ${busyId === o.id ? "opacity-50" : ""}`}>
                      <td className="px-4 py-2 font-mono text-xs text-gray-700">{o.id}</td>
                      <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                      <td className="px-4 py-2">
                        <div className="text-gray-900">{o.customerName}</div>
                        <div className="text-xs text-gray-500">{o.email}</div>
                      </td>
                      <td className="px-4 py-2 text-gray-600">{units}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatPrice(o.total)}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={o.status} />
                          <select
                            value={o.status}
                            onChange={(e) => changeStatus(o, e.target.value as OrderStatus)}
                            disabled={busyId === o.id}
                            className="border border-gray-300 rounded px-1.5 py-1 text-xs bg-white"
                            aria-label={`Change status of ${o.id}`}
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => setOpenId(open ? null : o.id)} className="text-orange-600 hover:underline text-xs">
                          {open ? "Hide" : "Details"}
                        </button>
                      </td>
                    </tr>
                    {open && (
                      <tr key={`${o.id}-details`} className="bg-gray-50">
                        <td colSpan={7} className="px-4 py-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Items</p>
                              <ul className="space-y-1">
                                {o.items.map((i) => {
                                  const p = products.find((x) => x.id === i.productId);
                                  return (
                                    <li key={i.productId} className="flex justify-between gap-3">
                                      <span className="text-gray-800">
                                        {productName(i.productId)} × {i.quantity}
                                      </span>
                                      <span className="text-gray-600">{p ? formatPrice(p.price * i.quantity) : "—"}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Ship to</p>
                              <p className="text-gray-800">{o.customerName}</p>
                              <p className="text-gray-600">{o.phone}</p>
                              <p className="text-gray-600">
                                {o.address}, {o.city}, {o.state} - {o.pincode}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">Payment: Cash on Delivery</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

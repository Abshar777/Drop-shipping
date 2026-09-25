"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { isDigital, isLowStock, lowStockThreshold } from "@/lib/product-utils";
import type { Product } from "@/lib/types";
import { PageHeader } from "./ui";

const JSON_HEADERS = { "Content-Type": "application/json" };

type Mode = "overview" | "low" | "adjust";

const TITLES: Record<Mode, [string, string]> = {
  overview: ["Stock Overview", "Current stock for every product."],
  low: ["Low Stock", "Physical products at or below their low-stock threshold. Restock them before they sell out."],
  adjust: ["Stock Adjustment", "Add received stock or remove damaged items. Every change is recorded in the inventory history."],
};

function stockLabel(p: Product) {
  if (isDigital(p)) return { text: "Digital", cls: "bg-purple-100 text-purple-700" };
  if (p.stock === 0) return { text: "Out of stock", cls: "bg-red-100 text-red-700" };
  if (isLowStock(p)) return { text: `Low (≤ ${lowStockThreshold(p)})`, cls: "bg-amber-100 text-amber-700" };
  return { text: "In stock", cls: "bg-green-100 text-green-700" };
}

export default function InventoryTable({ mode = "overview" }: { mode?: Mode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  function load() {
    return fetch("/api/products")
      .then((r) => r.json())
      .then((p) => {
        setProducts(Array.isArray(p) ? p : []);
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function adjust(product: Product, sign: 1 | -1) {
    const qty = Math.abs(Number(amounts[product.id] ?? "1")) || 1;
    setBusyId(product.id);
    setNotice(null);
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ productId: product.id, delta: sign * qty, reason: reason.trim() || undefined }),
    });
    const data = await res.json();
    if (res.ok) setNotice({ kind: "ok", text: `${product.name}: ${product.stock} → ${data.stock}` });
    else setNotice({ kind: "error", text: data.error || "Could not adjust stock" });
    await load();
    setBusyId(null);
  }

  const rows = products
    .filter((p) => (mode === "low" ? isLowStock(p) : true))
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.stock - b.stock);
  const [title, description] = TITLES[mode];
  const physical = rows.filter((p) => !isDigital(p));
  const totalUnits = physical.reduce((s, p) => s + p.stock, 0);

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        action={
          mode !== "adjust" ? (
            <Link href="/admin/inventory/adjust" className="bg-orange-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-orange-700 text-sm">
              Adjust stock
            </Link>
          ) : (
            <Link href="/admin/inventory/history" className="border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md hover:bg-gray-50 text-sm">
              View history
            </Link>
          )
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input type="search" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white sm:w-72" />
        {mode === "adjust" && (
          <input
            placeholder="Reason for the next change (e.g. New shipment, Damaged)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white flex-1"
          />
        )}
      </div>

      {notice && (
        <p className={`text-sm rounded-md px-3 py-2 border mb-3 ${notice.kind === "ok" ? "text-green-700 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"}`}>
          {notice.text}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-10 text-center text-sm text-gray-500">
          {mode === "low" ? "Nothing is running low." : "No products match."}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right">In stock</th>
                <th className="px-4 py-2 text-right">Stock value</th>
                <th className="px-4 py-2">Status</th>
                {mode === "adjust" && <th className="px-4 py-2 text-right">Adjust</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const s = stockLabel(p);
                const digital = isDigital(p);
                return (
                  <tr key={p.id} className={`border-t border-gray-100 ${busyId === p.id ? "opacity-50" : ""}`}>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.images[0]} alt="" className="w-9 h-9 object-cover rounded bg-gray-100" />
                        <span className="line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-600">{p.category}</td>
                    <td className="px-4 py-2 text-right">{formatPrice(p.price)}</td>
                    <td className="px-4 py-2 text-right font-semibold">{digital ? "∞" : p.stock}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{digital ? "—" : formatPrice(p.stock * p.price)}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.cls}`}>{s.text}</span>
                    </td>
                    {mode === "adjust" && (
                      <td className="px-4 py-2">
                        {digital ? (
                          <p className="text-xs text-gray-400 text-right">No stock for downloads</p>
                        ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => adjust(p, -1)} disabled={busyId === p.id || p.stock === 0} className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40" aria-label="Remove stock">
                            −
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={amounts[p.id] ?? "1"}
                            onChange={(e) => setAmounts({ ...amounts, [p.id]: e.target.value })}
                            className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                            aria-label="Quantity"
                          />
                          <button onClick={() => adjust(p, 1)} disabled={busyId === p.id} className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40" aria-label="Add stock">
                            +
                          </button>
                        </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 text-gray-700">
              <tr>
                <td className="px-4 py-2 font-medium" colSpan={3}>
                  {rows.length} products
                </td>
                <td className="px-4 py-2 text-right font-semibold">{totalUnits}</td>
                <td className="px-4 py-2 text-right font-semibold">{formatPrice(physical.reduce((s, p) => s + p.stock * p.price, 0))}</td>
                <td colSpan={mode === "adjust" ? 2 : 1} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

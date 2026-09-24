"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { PageHeader } from "./ui";

const JSON_HEADERS = { "Content-Type": "application/json" };
const TAGS = [
  { id: "trending", label: "Trending Now", hint: "Shown in the first row on the home page" },
  { id: "featured", label: "Featured Products", hint: "Shown in the second row on the home page" },
];

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  async function toggle(product: Product, tag: string) {
    const tags = new Set(product.tags ?? []);
    if (tags.has(tag)) tags.delete(tag);
    else tags.add(tag);
    setBusyId(product.id);
    await fetch(`/api/products/${product.id}`, { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify({ tags: [...tags] }) });
    await load();
    setBusyId(null);
  }

  return (
    <div>
      <PageHeader title="Featured Products" description="Choose which products appear in the Trending Now and Featured Products rows on the home page." />
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2">Product</th>
                {TAGS.map((t) => (
                  <th key={t.id} className="px-4 py-2">
                    <div>{t.label}</div>
                    <div className="text-[11px] font-normal text-gray-400">{t.hint}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={`border-t border-gray-100 ${busyId === p.id ? "opacity-50" : ""}`}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]} alt="" className="w-9 h-9 object-cover rounded bg-gray-100" />
                      <span className="line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  {TAGS.map((t) => (
                    <td key={t.id} className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={p.tags?.includes(t.id) ?? false}
                        onChange={() => toggle(p, t.id)}
                        disabled={busyId === p.id}
                        className="w-4 h-4 accent-orange-600"
                        aria-label={`${t.label}: ${p.name}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

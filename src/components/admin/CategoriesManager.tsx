"use client";

import { useEffect, useMemo, useState } from "react";
import { buildCategoryTree, categoryPath, flattenTree, type CategoryNode } from "@/lib/category-tree";
import { CATEGORY_ICONS, guessCategoryIcon, isCategoryIcon, resolveCategoryIcon } from "@/lib/category-icons";
import CategoryIcon from "@/components/CategoryIcon";
import type { Product, Category } from "@/lib/types";
import { PageHeader } from "./ui";

const JSON_HEADERS = { "Content-Type": "application/json" };
const SOURCE_LABEL: Record<string, string> = { store: "Store", meesho: "Meesho", noon: "noon" };

export default function CategoriesManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "store" | "meesho" | "noon">("all");
  const [onlyEnabled, setOnlyEnabled] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function fetchCategories() {
    return fetch("/api/categories?all=1")
      .then((r) => r.json())
      .then((d) => {
        setCategories(Array.isArray(d.categories) ? d.categories : []);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchCategories();
    fetch("/api/products")
      .then((r) => r.json())
      .then((p) => setProducts(Array.isArray(p) ? p : []));
  }, []);

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const flatAll = useMemo(() => flattenTree(tree), [tree]);
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const enabledCount = categories.filter((c) => c.enabled).length;

  const productCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const key = p.categoryId ?? categories.find((c) => !c.parentId && c.name === p.category)?.id;
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [products, categories]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
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
        const subtree = flattenTree([node]).map((r) => r.node);
        if (!subtree.some(matchesFilters)) continue;
        out.push({ node, depth, showPath: false });
        if (expanded.has(node.id)) walk(node.children, depth + 1);
      }
    };
    walk(tree, 0);
    return out;
  }, [flatAll, tree, search, sourceFilter, onlyEnabled, expanded]);

  const pathLabel = (id: string) => categoryPath(categories, id).map((c) => c.name).join(" › ");
  const hiddenByAncestor = (id: string) => categoryPath(categories, id).slice(0, -1).some((c) => !c.enabled);

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function patchCategory(id: string, body: Record<string, unknown>) {
    setError("");
    setBusyId(id);
    const res = await fetch(`/api/categories/${id}`, { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify(body) });
    if (!res.ok) setError((await res.json()).error || "Something went wrong");
    setBusyId(null);
    fetchCategories();
  }

  async function addCategory(parentId: string | null) {
    const label = parentId ? `New subcategory under "${categoryById.get(parentId)?.name}"` : "New top-level category";
    const name = prompt(label + "\n\nName:");
    if (!name || !name.trim()) return;
    setError("");
    const res = await fetch("/api/categories", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify({ name: name.trim(), parentId }) });
    if (!res.ok) setError((await res.json()).error || "Something went wrong");
    else if (parentId) setExpanded((prev) => new Set(prev).add(parentId));
    fetchCategories();
  }

  async function renameCategory(c: Category) {
    const name = prompt("Rename category:", c.name);
    if (!name || !name.trim() || name.trim() === c.name) return;
    await patchCategory(c.id, { name: name.trim() });
  }

  async function deleteCategory(c: Category) {
    const kids = categories.filter((x) => x.parentId === c.id).length;
    if (!confirm(kids ? `Delete "${c.name}" and all of its subcategories?` : `Delete "${c.name}"?`)) return;
    setError("");
    setBusyId(c.id);
    const res = await fetch(`/api/categories/${c.id}`, { method: "DELETE" });
    if (!res.ok) setError((await res.json()).error || "Something went wrong");
    setBusyId(null);
    fetchCategories();
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        description={`${enabledCount} of ${categories.length} visible on the storefront`}
        action={
          <button onClick={() => addCategory(null)} className="bg-orange-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-orange-700 text-sm">
            + Add Category
          </button>
        }
      />

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <input type="search" placeholder="Search categories…" value={search} onChange={(e) => setSearch(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm md:w-64 bg-white" />
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)} className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
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
        <button onClick={() => setExpanded(new Set(categories.filter((c) => categories.some((x) => x.parentId === c.id)).map((c) => c.id)))} className="text-sm text-gray-600 hover:text-orange-600">
          Expand all
        </button>
        <button onClick={() => setExpanded(new Set())} className="text-sm text-gray-600 hover:text-orange-600">
          Collapse all
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Enabled categories appear in the storefront menu, the home page, and the product filter. A subcategory only shows if every parent above it is enabled too. Use{" "}
        <span className="font-medium">All on / All off</span> to switch a whole branch at once.
      </p>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : rows.length === 0 ? (
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
              {rows.map(({ node, depth, showPath }) => {
                const kids = node.children.length;
                const open = expanded.has(node.id);
                const busy = busyId === node.id;
                const shadowed = node.enabled && hiddenByAncestor(node.id);
                return (
                  <tr key={node.id} className={`border-t border-gray-100 ${busy ? "opacity-50" : ""}`}>
                    <td className="px-4 py-1.5">
                      <div className="flex items-center gap-1" style={{ paddingLeft: `${depth * 1.25}rem` }}>
                        {kids > 0 && !showPath ? (
                          <button onClick={() => toggleExpanded(node.id)} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 shrink-0" aria-label={open ? "Collapse" : "Expand"}>
                            {open ? "▾" : "▸"}
                          </button>
                        ) : (
                          <span className="w-5 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <span className={depth === 0 && !showPath ? "font-semibold text-gray-900" : "text-gray-800"}>{node.name}</span>
                          {kids > 0 && <span className="ml-2 text-xs text-gray-400">{kids} sub</span>}
                          {showPath && <div className="text-xs text-gray-400 truncate">{pathLabel(node.id)}</div>}
                          {shadowed && <div className="text-xs text-amber-600">Hidden because a parent category is off</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-1.5">
                      {!node.parentId && (
                        <div className="flex items-center gap-1.5">
                          <CategoryIcon name={resolveCategoryIcon(node)} className="w-7 h-7 text-gray-700 shrink-0" />
                          <select value={isCategoryIcon(node.icon) ? node.icon : ""} onChange={(e) => patchCategory(node.id, { icon: e.target.value })} disabled={busy} className="border border-gray-300 rounded px-1 py-0.5 text-xs bg-white" title="Icon shown in the category bar">
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
                      <span className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">{SOURCE_LABEL[node.source ?? "store"]}</span>
                    </td>
                    <td className="px-3 py-1.5">
                      <button
                        onClick={() => patchCategory(node.id, { enabled: !node.enabled })}
                        disabled={busy}
                        role="switch"
                        aria-checked={node.enabled}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${node.enabled ? "bg-green-500" : "bg-gray-300"}`}
                        title={node.enabled ? "Visible on storefront. Click to hide." : "Hidden. Click to show."}
                      >
                        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${node.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                      </button>
                    </td>
                    <td className="px-3 py-1.5 text-right whitespace-nowrap text-xs">
                      {kids > 0 && (
                        <>
                          <button onClick={() => patchCategory(node.id, { enabled: true, cascade: true })} className="text-green-700 hover:underline mr-2" title="Enable this category and everything under it">
                            All on
                          </button>
                          <button onClick={() => patchCategory(node.id, { enabled: false, cascade: true })} className="text-gray-500 hover:underline mr-2" title="Disable this category and everything under it">
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
  );
}

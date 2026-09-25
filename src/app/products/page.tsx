import Link from "next/link";
import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import { buildCategoryTree, categoryPath, descendantIds, type CategoryNode } from "@/lib/category-tree";
import { getT } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n";
import { stripHtml } from "@/lib/html";
import { isDigital } from "@/lib/product-utils";
import ProductCard from "@/components/ProductCard";

type SearchParams = { category?: string; q?: string; type?: string };

function CategoryList({
  nodes,
  selectedId,
  openIds,
  depth = 0,
}: {
  nodes: CategoryNode[];
  selectedId?: string;
  openIds: Set<string>;
  depth?: number;
}) {
  return (
    <ul className={depth === 0 ? "space-y-1" : "mt-1 space-y-1 border-s border-border ms-2"}>
      {nodes.map((node) => {
        const active = node.id === selectedId;
        const open = openIds.has(node.id);
        return (
          <li key={node.id}>
            <Link
              href={`/products?category=${encodeURIComponent(node.id)}`}
              className={`flex items-center justify-between gap-2 px-2 py-1 rounded-btn ${
                active ? "bg-primary-soft text-primary font-medium" : "text-muted hover:text-primary"
              }`}
              style={{ paddingInlineStart: `${0.5 + depth * 0.5}rem` }}
            >
              <span className="truncate">{node.name}</span>
              {node.children.length > 0 && (
                <span className="text-[10px] text-muted shrink-0">{open ? "▾" : "▸"}</span>
              )}
            </Link>
            {open && node.children.length > 0 && (
              <CategoryList nodes={node.children} selectedId={selectedId} openIds={openIds} depth={depth + 1} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category: categoryParam, q, type: typeParam } = await searchParams;
  const [products, allCategories, { t }] = await Promise.all([getProducts(), getCategories(), getT()]);
  const tree = buildCategoryTree(allCategories, { enabledOnly: true });

  // Accept a category id (new links) or a plain name (old links / hand-typed URLs).
  const selected = categoryParam
    ? allCategories.find((c) => c.id === categoryParam) ??
      allCategories.find((c) => !c.parentId && c.name.toLowerCase() === categoryParam.toLowerCase())
    : undefined;

  const path = selected ? categoryPath(allCategories, selected.id) : [];
  const openIds = new Set(path.map((c) => c.id));

  let filtered = products;
  if (selected) {
    // A category shows its own products plus everything in its subcategories.
    const ids = descendantIds(allCategories, selected.id);
    const names = new Set(allCategories.filter((c) => ids.has(c.id)).map((c) => c.name));
    filtered = filtered.filter((p) => (p.categoryId ? ids.has(p.categoryId) : names.has(p.category)));
  }
  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(query) || stripHtml(p.description).toLowerCase().includes(query)
    );
  }

  // Physical / digital filter, shown only once the store sells downloads.
  const type = typeParam === "digital" || typeParam === "physical" ? typeParam : undefined;
  const hasDigital = products.some(isDigital);
  if (type) filtered = filtered.filter((p) => isDigital(p) === (type === "digital"));
  const typeHref = (value?: string) => {
    const params = new URLSearchParams();
    if (selected) params.set("category", selected.id);
    if (q) params.set("q", q);
    if (value) params.set("type", value);
    const query = params.toString();
    return query ? `/products?${query}` : "/products";
  };
  const typeChips: Array<[string, string]> = [
    ["", t.products.typeAll],
    ["physical", t.products.typePhysical],
    ["digital", t.products.typeDigital],
  ];

  const heading = q ? fmt(t.products.searchResults, { q }) : selected?.name ?? t.products.allProducts;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row gap-8">
        <aside className="sm:w-60 shrink-0">
          <h2 className="font-bold text-foreground mb-3">{t.products.categories}</h2>
          <div className="text-sm">
            <Link
              href="/products"
              className={`block px-2 py-1 rounded-btn mb-1 ${
                !selected ? "bg-primary-soft text-primary font-medium" : "text-muted hover:text-primary"
              }`}
            >
              {t.products.allProducts}
            </Link>
            <CategoryList nodes={tree} selectedId={selected?.id} openIds={openIds} />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {path.length > 1 && (
            <nav className="text-xs text-muted mb-2 flex flex-wrap items-center gap-1">
              <Link href="/products" className="hover:text-primary">{t.products.all}</Link>
              {path.map((c) => (
                <span key={c.id} className="flex items-center gap-1">
                  <span>›</span>
                  <Link href={`/products?category=${encodeURIComponent(c.id)}`} className="hover:text-primary">
                    {c.name}
                  </Link>
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-2xl font-bold text-foreground mb-1">{heading}</h1>
          <p className="text-sm text-muted mb-4">{fmt(t.products.found, { n: filtered.length })}</p>

          {hasDigital && (
            <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
              <span className="text-muted">{t.products.typeFilter}:</span>
              {typeChips.map(([value, label]) => (
                <Link
                  key={value}
                  href={typeHref(value || undefined)}
                  className={`px-3 py-1 rounded-full border transition-colors ${
                    (type ?? "") === value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted hover:text-primary"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="text-muted">{t.products.none}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

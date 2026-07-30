import { getProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

type SearchParams = { category?: string; q?: string };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, q } = await searchParams;
  const products = await getProducts();
  const categories = Array.from(new Set(products.map((p) => p.category)));

  let filtered = products;
  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }
  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row gap-8">
        <aside className="sm:w-56 shrink-0">
          <h2 className="font-bold text-gray-900 mb-3">Categories</h2>
          <ul className="space-y-1 text-sm">
            <li>
              <a
                href="/products"
                className={`block px-2 py-1 rounded ${!category ? "bg-orange-50 text-orange-600 font-medium" : "text-gray-600 hover:text-orange-600"}`}
              >
                All Products
              </a>
            </li>
            {categories.map((cat) => (
              <li key={cat}>
                <a
                  href={`/products?category=${encodeURIComponent(cat)}`}
                  className={`block px-2 py-1 rounded ${category === cat ? "bg-orange-50 text-orange-600 font-medium" : "text-gray-600 hover:text-orange-600"}`}
                >
                  {cat}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {q ? `Search results for "${q}"` : category || "All Products"}
          </h1>
          <p className="text-sm text-gray-500 mb-6">{filtered.length} products found</p>

          {filtered.length === 0 ? (
            <p className="text-gray-500">No products found. Try a different search or category.</p>
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

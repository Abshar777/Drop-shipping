import Link from "next/link";
import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import { buildCategoryTree } from "@/lib/category-tree";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  const [products, allCategories] = await Promise.all([getProducts(), getCategories()]);
  const featured = products.filter((p) => p.tags?.includes("featured"));
  const trending = products.filter((p) => p.tags?.includes("trending"));

  // Only categories the admin has enabled appear on the storefront.
  const categories = buildCategoryTree(allCategories, { enabledOnly: true });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <section className="rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white px-6 py-12 sm:px-12 sm:py-16 mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold max-w-xl">
          Trending finds, delivered to your door.
        </h1>
        <p className="mt-3 text-orange-50 max-w-lg">
          Shop the best deals on electronics, home goods, fashion, and more &mdash; all in one place.
        </p>
        <Link
          href="/products"
          className="inline-block mt-6 bg-white text-orange-700 font-semibold px-6 py-2.5 rounded-md hover:bg-orange-50"
        >
          Shop Now
        </Link>
      </section>

      {categories.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.id)}`}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-sm font-medium text-gray-700 hover:border-orange-400 hover:text-orange-600"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {trending.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Trending Now</h2>
            <Link href="/products" className="text-sm text-orange-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {trending.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
            <Link href="/products" className="text-sm text-orange-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

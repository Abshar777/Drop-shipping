import Link from "next/link";
import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import { buildCategoryTree } from "@/lib/category-tree";
import { getT } from "@/lib/i18n/server";
import { resolveCategoryIcon } from "@/lib/category-icons";
import CategoryIcon from "@/components/CategoryIcon";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  const [products, allCategories, { t }] = await Promise.all([getProducts(), getCategories(), getT()]);
  const featured = products.filter((p) => p.tags?.includes("featured"));
  const trending = products.filter((p) => p.tags?.includes("trending"));

  // Only categories the admin has enabled appear on the storefront.
  const categories = buildCategoryTree(allCategories, { enabledOnly: true });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <section className="rounded-card bg-hero text-hero-foreground px-6 py-12 sm:px-12 sm:py-16 mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold max-w-xl">{t.home.heroTitle}</h1>
        <p className="mt-3 opacity-80 max-w-lg">{t.home.heroSubtitle}</p>
        <Link
          href="/products"
          className="inline-block mt-6 bg-hero-button text-hero-button-foreground font-semibold px-6 py-2.5 rounded-btn hover:opacity-90"
        >
          {t.home.shopNow}
        </Link>
      </section>

      {categories.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4">{t.home.shopByCategory}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.id)}`}
                className="bg-surface border border-border rounded-card p-4 flex flex-col items-center gap-2 text-center text-sm font-medium text-foreground hover:border-primary hover:text-primary"
              >
                <CategoryIcon name={resolveCategoryIcon(cat)} className="w-8 h-8" />
                <span className="leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {trending.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">{t.home.trendingNow}</h2>
            <Link href="/products" className="text-sm text-primary hover:underline">
              {t.common.viewAll}
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
            <h2 className="text-xl font-bold text-foreground">{t.home.featured}</h2>
            <Link href="/products" className="text-sm text-primary hover:underline">
              {t.common.viewAll}
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

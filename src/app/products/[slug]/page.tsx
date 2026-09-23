import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { getT } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n";
import AddToCart from "@/components/AddToCart";
import ProductCard from "@/components/ProductCard";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, { t }] = await Promise.all([getProductBySlug(slug), getT()]);

  if (!product) notFound();

  const allProducts = await getProducts();
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discount = product.compareAtPrice
    ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square bg-surface rounded-card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {product.images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={img}
                  alt={`${product.name} ${i + 1}`}
                  className="aspect-square object-cover rounded-input border border-border"
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-primary font-medium">{product.category}</p>
          <h1 className="text-2xl font-bold text-foreground mt-1">{product.name}</h1>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="text-accent">{"★".repeat(Math.round(product.rating))}</span>
            <span className="text-muted">
              {fmt(t.product.reviews, { rating: product.rating, n: product.reviewCount })}
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-3xl font-bold text-foreground">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <>
                <span className="text-lg text-muted line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="text-sm font-semibold text-primary">{fmt(t.product.off, { n: discount })}</span>
              </>
            )}
          </div>

          <p className="text-sm mt-2">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">{fmt(t.product.inStock, { n: product.stock })}</span>
            ) : (
              <span className="text-red-600 font-medium">{t.product.outOfStock}</span>
            )}
          </p>

          <p className="text-muted mt-4 leading-relaxed whitespace-pre-line">{product.description}</p>

          <div className="mt-6">
            <AddToCart productId={product.id} stock={product.stock} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold text-foreground mb-4">{t.product.related}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

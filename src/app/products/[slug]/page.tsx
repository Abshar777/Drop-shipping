import { Fragment } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { getT } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n";
import { stripHtml } from "@/lib/html";
import { discountPercent, isDigital } from "@/lib/product-utils";
import { productSpecRows } from "@/lib/product-specs";
import AddToCart from "@/components/AddToCart";
import ProductCard from "@/components/ProductCard";
import ProductDescription from "@/components/ProductDescription";
import ProductTypeBadge from "@/components/ProductTypeBadge";
import ProductVideo from "@/components/ProductVideo";
import AmazonProductPage from "@/components/product-layouts/AmazonProductPage";
import FlipkartProductPage from "@/components/product-layouts/FlipkartProductPage";

type Props = { params: Promise<{ slug: string }> };

/** Search engines see the SEO fields from the admin, falling back to the product itself. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const title = product.seo?.title || `${product.name} | anyitems.in`;
  const description = product.seo?.description || stripHtml(product.description).slice(0, 160);
  return {
    title,
    description,
    openGraph: { title, description, images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, { t }] = await Promise.all([getProductBySlug(slug), getT()]);

  if (!product) notFound();

  const allProducts = await getProducts();
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Per-product page design chosen in the admin.
  if (product.layout === "amazon") return <AmazonProductPage product={product} related={related} t={t} />;
  if (product.layout === "flipkart") return <FlipkartProductPage product={product} related={related} t={t} />;

  const discount = discountPercent(product);
  const digital = isDigital(product);
  const specs = productSpecRows(product, t);

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
          {product.videoUrl && (
            <div className="mt-4">
              <h2 className="text-sm font-bold text-foreground mb-2">{t.product.video}</h2>
              <ProductVideo url={product.videoUrl} className="rounded-card" />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-primary font-medium">{product.category}</p>
            <ProductTypeBadge digital={digital} t={t} />
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1">{product.name}</h1>
          {product.brand && (
            <p className="text-sm text-muted mt-1">
              {t.product.brand}: <span className="text-foreground font-medium">{product.brand}</span>
            </p>
          )}
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
            {digital ? (
              <span className="text-green-600 font-medium">
                {t.product.alwaysAvailable} · {t.product.instantDownload}
              </span>
            ) : product.stock > 0 ? (
              <span className="text-green-600 font-medium">{fmt(t.product.inStock, { n: product.stock })}</span>
            ) : (
              <span className="text-red-600 font-medium">{t.product.outOfStock}</span>
            )}
          </p>

          <ProductDescription text={product.description} className="text-muted mt-4 leading-relaxed" />

          <div className="mt-6">
            <AddToCart productId={product.id} stock={product.stock} digital={digital} />
          </div>

          {specs.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-bold text-foreground mb-2">{t.product.details}</h2>
              <dl className="grid grid-cols-[minmax(7rem,auto)_1fr] gap-x-4 gap-y-1.5 text-sm bg-surface border border-border rounded-card p-4">
                {specs.map((row) => (
                  <Fragment key={row.label}>
                    <dt className="text-muted">{row.label}</dt>
                    <dd className="text-foreground">{row.value}</dd>
                  </Fragment>
                ))}
              </dl>
            </section>
          )}
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

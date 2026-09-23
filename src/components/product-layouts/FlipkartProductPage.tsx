import Link from "next/link";
import type { Product } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";
import { fmt } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { descriptionBullets } from "@/lib/html";
import AddToCart from "@/components/AddToCart";
import ProductCard from "@/components/ProductCard";
import ProductDescription from "@/components/ProductDescription";

/**
 * Flipkart-style product page: sticky gallery with big Add to Cart / Buy Now under it,
 * green rating badge, special price, offers, highlights, description card.
 * Uses Flipkart's fixed palette rather than the store theme.
 */
export default function FlipkartProductPage({
  product,
  related,
  t,
}: {
  product: Product;
  related: Product[];
  t: Dictionary;
}) {
  const discount = product.compareAtPrice ? Math.round(100 - (product.price / product.compareAtPrice) * 100) : 0;
  const bullets = descriptionBullets(product.description);

  return (
    <div className="bg-[#f1f3f6] py-4 text-[#212121]" style={{ colorScheme: "light", fontFamily: 'Roboto, Arial, "Helvetica Neue", sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white grid grid-cols-1 md:grid-cols-12">
          {/* Gallery + actions */}
          <div className="md:col-span-5 p-4 md:sticky md:top-40 self-start">
            <div className="flex gap-3">
              {product.images.length > 1 && (
                <div className="hidden sm:flex flex-col gap-2 w-16">
                  {product.images.map((img, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className={`w-16 h-16 object-cover border-2 rounded-sm ${i === 0 ? "border-[#2874f0]" : "border-[#f0f0f0]"}`}
                    />
                  ))}
                </div>
              )}
              <div className="flex-1 border border-[#f0f0f0] rounded-sm p-3 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.images[0]} alt={product.name} className="max-h-[420px] w-full object-contain" />
              </div>
            </div>
            <div className="mt-4">
              <AddToCart productId={product.id} stock={product.stock} variant="flipkart" showQuantity={false} />
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-7 p-4 md:p-6">
            <p className="text-xs text-[#878787]">
              <Link href="/" className="hover:text-[#2874f0]">Home</Link>
              <span className="mx-1">›</span>
              <Link href={`/products?category=${encodeURIComponent(product.categoryId ?? product.category)}`} className="hover:text-[#2874f0]">
                {product.category}
              </Link>
              <span className="mx-1">›</span>
              <span>{product.name}</span>
            </p>
            <h1 className="text-lg font-normal mt-1.5">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 bg-[#388e3c] text-white text-xs font-medium px-1.5 py-0.5 rounded-sm">
                {product.rating} ★
              </span>
              <span className="text-sm text-[#878787] font-medium">{product.reviewCount} Ratings &amp; Reviews</span>
            </div>

            {discount > 0 && <p className="text-[#388e3c] text-sm font-medium mt-4">Special price</p>}
            <div className="flex items-baseline gap-3 mt-0.5">
              <span className="text-3xl font-medium">{formatPrice(product.price)}</span>
              {product.compareAtPrice && (
                <>
                  <span className="text-[#878787] line-through">{formatPrice(product.compareAtPrice)}</span>
                  <span className="text-[#388e3c] font-medium">{discount}% off</span>
                </>
              )}
            </div>

            <h2 className="font-medium mt-5 mb-2">Available offers</h2>
            <ul className="text-sm space-y-1.5">
              <li className="flex gap-2"><span className="text-[#388e3c]">🏷</span><span><b>Free delivery</b> on this item</span></li>
              <li className="flex gap-2"><span className="text-[#388e3c]">🏷</span><span><b>Cash on Delivery</b> available</span></li>
              <li className="flex gap-2"><span className="text-[#388e3c]">🏷</span><span><b>7 days</b> replacement policy</span></li>
            </ul>

            <div className="grid grid-cols-[110px_1fr] gap-y-4 mt-6 text-sm">
              <span className="text-[#878787]">Highlights</span>
              {bullets.length > 0 ? (
                <ul className="list-disc ps-5 space-y-1">
                  {bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-[#878787]">No highlights added yet.</span>
              )}
              <span className="text-[#878787]">Availability</span>
              <span className={product.stock > 0 ? "text-[#388e3c]" : "text-[#ff6161]"}>
                {product.stock > 0 ? fmt(t.product.inStock, { n: product.stock }) : t.product.outOfStock}
              </span>
            </div>

            <div className="mt-6 border border-[#f0f0f0]">
              <h2 className="px-4 py-3 text-lg font-medium border-b border-[#f0f0f0]">Description</h2>
              <div className="p-4 text-sm">
                <ProductDescription text={product.description} className="leading-relaxed" />
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="bg-white mt-4 p-4 md:p-6">
            <h2 className="text-lg font-medium mb-4">{fmt(t.product.related, {})}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

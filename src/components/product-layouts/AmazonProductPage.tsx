import Link from "next/link";
import type { Product } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";
import { fmt } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { descriptionBullets } from "@/lib/html";
import { discountPercent, isDigital } from "@/lib/product-utils";
import { productSpecRows } from "@/lib/product-specs";
import AddToCart from "@/components/AddToCart";
import ProductCard from "@/components/ProductCard";
import ProductDescription from "@/components/ProductDescription";
import ProductVideo from "@/components/ProductVideo";

/**
 * Amazon-style product page: gallery on the left, details and "About this item" in the
 * middle, a buy box on the right. Uses the Amazon fixed palette rather than the store theme.
 */
export default function AmazonProductPage({
  product,
  related,
  t,
}: {
  product: Product;
  related: Product[];
  t: Dictionary;
}) {
  const discount = discountPercent(product);
  const bullets = descriptionBullets(product.description);
  const stars = Math.round(product.rating);
  const digital = isDigital(product);
  const specs = productSpecRows(product, t);
  const available = digital || product.stock > 0;

  return (
    <div
      className="bg-white text-[#0F1111]"
      style={{ colorScheme: "light", fontFamily: '"Amazon Ember", Arial, "Helvetica Neue", sans-serif' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Gallery */}
          <div className="md:col-span-5 flex gap-3">
            {product.images.length > 1 && (
              <div className="hidden sm:flex flex-col gap-2">
                {product.images.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    className={`w-11 h-11 object-cover rounded border ${i === 0 ? "border-[#e77600] shadow-[0_0_0_2px_#fde9d0]" : "border-[#a2a6ac]"}`}
                  />
                ))}
              </div>
            )}
            <div className="flex-1 flex items-start justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.images[0]} alt={product.name} className="max-h-[480px] w-full object-contain" />
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-4">
            <h1 className="text-2xl leading-snug">{product.name}</h1>
            {product.brand && <p className="text-sm text-[#007185]">Brand: {product.brand}</p>}
            <Link
              href={`/products?category=${encodeURIComponent(product.categoryId ?? product.category)}`}
              className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline"
            >
              Visit the {product.category} store
            </Link>
            <div className="flex items-center gap-2 mt-1 text-sm">
              <span className="text-[#FFA41C] tracking-tight">
                {"★".repeat(stars)}
                <span className="text-[#e3e6e6]">{"★".repeat(5 - stars)}</span>
              </span>
              <span className="text-[#007185]">{product.reviewCount} ratings</span>
            </div>
            {digital && (
              <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#007600] bg-[#e8f5e9] border border-[#c8e6c9] rounded px-2 py-0.5">
                ⬇ {t.product.digital}
              </span>
            )}

            <hr className="my-3 border-[#e7e7e7]" />

            <div className="flex items-baseline gap-2">
              {discount > 0 && <span className="text-[#CC0C39] text-2xl">-{discount}%</span>}
              <span className="text-3xl">{formatPrice(product.price)}</span>
            </div>
            {product.compareAtPrice && (
              <p className="text-sm text-[#565959]">
                M.R.P.: <s>{formatPrice(product.compareAtPrice)}</s>
              </p>
            )}
            <p className="text-sm text-[#565959]">Inclusive of all taxes</p>

            <hr className="my-3 border-[#e7e7e7]" />

            <h2 className="font-bold text-base mb-1.5">About this item</h2>
            {bullets.length > 0 ? (
              <ul className="list-disc ps-5 text-sm space-y-1">
                {bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#565959]">No details added yet.</p>
            )}

            {specs.length > 0 && (
              <>
                <hr className="my-3 border-[#e7e7e7]" />
                <h2 className="font-bold text-base mb-1.5">{t.product.details}</h2>
                <table className="w-full text-sm border border-[#e7e7e7]">
                  <tbody>
                    {specs.map((row) => (
                      <tr key={row.label} className="border-b border-[#e7e7e7] last:border-b-0">
                        <th className="text-start font-bold bg-[#f7f7f7] px-3 py-1.5 w-2/5 align-top">{row.label}</th>
                        <td className="px-3 py-1.5">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>

          {/* Buy box */}
          <div className="md:col-span-3">
            <div className="border border-[#d5d9d9] rounded-lg p-4 text-sm">
              <div className="text-3xl mb-1">{formatPrice(product.price)}</div>
              <p className="text-[#007185]">
                {digital ? t.product.instantDownload : product.shippingRequired === false ? t.product.noShipping : "FREE delivery"}
              </p>
              <p className={`text-lg my-2 ${available ? "text-[#007600]" : "text-[#CC0C39]"}`}>
                {digital ? t.product.alwaysAvailable : product.stock > 0 ? "In stock" : t.product.outOfStock}
              </p>
              <AddToCart productId={product.id} stock={product.stock} variant="amazon" digital={digital} />
              <div className="mt-3 text-xs text-[#565959] space-y-0.5">
                <p>🔒 Secure transaction</p>
                {digital ? (
                  <p>
                    Delivered by <span className="text-[#0F1111]">anyitems.in</span> as a download
                  </p>
                ) : (
                  <p>
                    Ships from <span className="text-[#0F1111]">anyitems.in</span>
                  </p>
                )}
                <p>
                  Sold by <span className="text-[#0F1111]">anyitems.in</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10 max-w-4xl">
          <h2 className="text-lg font-bold mb-2">Product description</h2>
          <ProductDescription text={product.description} className="text-sm text-[#333] leading-relaxed" />
        </section>

        {product.videoUrl && (
          <section className="mt-8 max-w-4xl">
            <h2 className="text-lg font-bold mb-2">{t.product.video}</h2>
            <ProductVideo url={product.videoUrl} className="rounded-lg" />
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold mb-4">{fmt(t.product.related, {})}</h2>
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

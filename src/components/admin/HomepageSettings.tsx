import Link from "next/link";
import { getCategories } from "@/lib/categories";
import { getProducts } from "@/lib/products";
import { getThemeSettings } from "@/lib/theme-store";
import { resolveTheme } from "@/lib/themes";
import { PageHeader, Card } from "./ui";

/** Map of what makes up the storefront home page, with links to where each part is edited. */
export default async function HomepageSettings() {
  const [categories, products, themeSettings] = await Promise.all([getCategories(), getProducts(), getThemeSettings()]);
  const theme = resolveTheme(themeSettings);
  const enabledTop = categories.filter((c) => !c.parentId && c.enabled).length;
  const trending = products.filter((p) => p.tags?.includes("trending")).length;
  const featured = products.filter((p) => p.tags?.includes("featured")).length;

  const parts = [
    {
      title: "Hero banner",
      value: `Theme “${theme.name}” colours and font`,
      hint: "The gradient, text colour, and button style come from the active theme.",
      href: "/admin/website/theme",
      cta: "Edit theme",
    },
    {
      title: "Category bar",
      value: `${enabledTop} categories showing`,
      hint: "Enabled top-level categories appear as icon tiles under the header and in Shop by Category.",
      href: "/admin/categories",
      cta: "Manage categories",
    },
    {
      title: "Trending Now",
      value: `${trending} products`,
      hint: "Products tagged Trending fill the first product row.",
      href: "/admin/website/featured",
      cta: "Choose products",
    },
    {
      title: "Featured Products",
      value: `${featured} products`,
      hint: "Products tagged Featured fill the second product row.",
      href: "/admin/website/featured",
      cta: "Choose products",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Homepage"
        description="The home page is built from these parts. Edit each where it lives."
        action={
          <Link href="/" className="border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md hover:bg-gray-50 text-sm">
            View home page ↗
          </Link>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {parts.map((p) => (
          <Card key={p.title} className="p-5 flex flex-col gap-2">
            <h2 className="font-semibold text-gray-900">{p.title}</h2>
            <p className="text-lg text-gray-900">{p.value}</p>
            <p className="text-sm text-gray-500 flex-1">{p.hint}</p>
            <Link href={p.href} className="text-sm text-orange-600 hover:underline font-medium">
              {p.cta} →
            </Link>
          </Card>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-4">Hero text is set per language in the translation files. Banners, announcement bar, and custom pages are planned sections.</p>
    </div>
  );
}

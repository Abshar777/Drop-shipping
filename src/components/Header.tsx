"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useT } from "@/lib/i18n/client";
import { fmt } from "@/lib/i18n";
import type { CategoryNode } from "@/lib/category-tree";
import { resolveCategoryIcon } from "@/lib/category-icons";
import CategoryIcon from "@/components/CategoryIcon";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export type HeaderUser = { id: string; name: string; email: string };
export type HeaderAdmin = { id: string; name: string };

/**
 * Storefront header. The signed-in customer, the admin session, and the enabled category
 * tree come from the root layout on every request, so logging in or out anywhere (and the
 * router.refresh() that follows) updates the header immediately.
 */
export default function Header({
  user,
  admin,
  categories,
}: {
  user: HeaderUser | null;
  admin: HeaderAdmin | null;
  categories: CategoryNode[];
}) {
  const { itemCount } = useCart();
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const userLoaded = true;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  // The admin has its own shell; keep the storefront chrome off those pages (login included).
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="text-2xl font-extrabold text-primary tracking-tight shrink-0">
            anyitems<span className="text-foreground">.in</span>
          </Link>

          <form action="/products" className="hidden md:flex flex-1 max-w-xl">
            <input
              type="text"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.common.searchPlaceholder}
              className="w-full rounded-s-input border border-border bg-surface text-foreground placeholder:text-muted px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="rounded-e-btn bg-primary px-4 text-primary-foreground text-sm font-medium hover:bg-primary-hover"
            >
              {t.common.search}
            </button>
          </form>

          <div className="flex items-center gap-4 shrink-0">
            {admin && (
              <Link
                href="/admin"
                title={admin.name}
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium bg-primary-soft text-primary px-3 py-1.5 rounded-btn hover:bg-primary hover:text-primary-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12l1.8 1.8L15 10" />
                </svg>
                {t.common.admin}
              </Link>
            )}
            <LanguageSwitcher className="hidden sm:flex" />

            {userLoaded && (
              <div className="hidden sm:flex items-center gap-3 text-sm">
                {user ? (
                  <>
                    <span className="text-muted">
                      {t.common.greeting.split("{name}")[0]}
                      <span className="font-medium text-foreground">{user.name}</span>
                      {t.common.greeting.split("{name}")[1]}
                    </span>
                    <button onClick={handleLogout} className="text-muted hover:text-primary font-medium">
                      {t.common.logout}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-muted hover:text-primary font-medium">
                      {t.common.login}
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-primary text-primary-foreground font-medium px-3 py-1.5 rounded-btn hover:bg-primary-hover"
                    >
                      {t.common.signup}
                    </Link>
                  </>
                )}
              </div>
            )}

            <Link
              href="/cart"
              className="relative flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.907-4.708 2.322-7.184a1.125 1.125 0 00-1.107-1.316H5.106M7.5 14.25L5.106 5.25M9.75 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm9 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -end-3 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
              <span className="hidden sm:inline">{t.common.cart}</span>
            </Link>
          </div>
        </div>

        {/* Category bar: icon above name. Scrolls on small screens; wraps and shows hover menus on md+. */}
        <nav className="flex items-start gap-1 sm:gap-2 overflow-x-auto md:overflow-visible md:flex-wrap md:justify-center py-1.5 text-sm">
          <LanguageSwitcher className="sm:hidden shrink-0 self-center me-2" />
            {admin && (
              <Link
                href="/admin"
                title={admin.name}
                className="sm:hidden shrink-0 self-center me-2 inline-flex items-center gap-1.5 text-sm font-medium bg-primary-soft text-primary px-3 py-1.5 rounded-btn hover:bg-primary hover:text-primary-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12l1.8 1.8L15 10" />
                </svg>
                {t.common.admin}
              </Link>
            )}
          {/* Fixed-width tiles that scroll on small screens; on md+ they flex between 4.5rem and 6.5rem so a full bar fits one row. */}
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group relative shrink-0 w-[4.75rem] md:w-auto md:shrink md:flex-1 md:min-w-[4.5rem] md:max-w-[6.5rem]"
            >
              <Link
                href={`/products?category=${encodeURIComponent(cat.id)}`}
                className="flex flex-col items-center gap-1 w-full px-1 py-1.5 rounded-card text-foreground hover:bg-primary-soft hover:text-primary"
                title={cat.name}
              >
                <CategoryIcon name={resolveCategoryIcon(cat)} className="w-7 h-7 sm:w-8 sm:h-8" />
                <span className="w-full text-center text-[11px] sm:text-sm font-medium leading-tight truncate">
                  {cat.name}
                </span>
              </Link>

              {cat.children.length > 0 && (
                <div className="absolute start-0 top-full z-50 hidden md:group-hover:block pt-1">
                  <div className="bg-background border border-border rounded-card shadow-lg p-3 min-w-[14rem] max-w-[56rem]">
                    {cat.children.some((group) => group.children.length > 0) ? (
                      /* Groups with their own subcategories: one column per group, items listed downwards. */
                      <div
                        className="grid gap-x-8 gap-y-5 p-2"
                        style={{ gridTemplateColumns: `repeat(${Math.min(cat.children.length, 4)}, minmax(10rem, max-content))` }}
                      >
                        {cat.children.map((group) => (
                          <div key={group.id}>
                            <Link
                              href={`/products?category=${encodeURIComponent(group.id)}`}
                              className="block font-semibold text-foreground hover:text-primary whitespace-nowrap"
                            >
                              {group.name}
                            </Link>
                            {group.children.length > 0 && (
                              <ul className="mt-1.5 space-y-1">
                                {group.children.slice(0, 8).map((leaf) => (
                                  <li key={leaf.id}>
                                    <Link
                                      href={`/products?category=${encodeURIComponent(leaf.id)}`}
                                      className="text-muted hover:text-primary whitespace-nowrap"
                                    >
                                      {leaf.name}
                                    </Link>
                                  </li>
                                ))}
                                {group.children.length > 8 && (
                                  <li>
                                    <Link
                                      href={`/products?category=${encodeURIComponent(group.id)}`}
                                      className="text-primary hover:underline text-xs"
                                    >
                                      {fmt(t.common.viewAllCount, { n: group.children.length })}
                                    </Link>
                                  </li>
                                )}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Plain subcategories: a single list, top to bottom. */
                      <ul className="flex flex-col">
                        {cat.children.map((group) => (
                          <li key={group.id}>
                            <Link
                              href={`/products?category=${encodeURIComponent(group.id)}`}
                              className="block px-3 py-2 rounded-btn text-foreground hover:bg-primary-soft hover:text-primary whitespace-nowrap"
                            >
                              {group.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}

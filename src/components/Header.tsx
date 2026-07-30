"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";

const CATEGORIES = ["Electronics", "Home & Kitchen", "Fashion", "Beauty", "Fitness", "Toys"];

export default function Header() {
  const { itemCount } = useCart();
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="text-2xl font-extrabold text-orange-600 tracking-tight shrink-0">
            anyitems<span className="text-gray-900">.in</span>
          </Link>

          <form
            action="/products"
            className="hidden md:flex flex-1 max-w-xl"
          >
            <input
              type="text"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full rounded-l-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="rounded-r-md bg-orange-600 px-4 text-white text-sm font-medium hover:bg-orange-700"
            >
              Search
            </button>
          </form>

          <Link
            href="/cart"
            className="relative flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-orange-600 shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.907-4.708 2.322-7.184a1.125 1.125 0 00-1.107-1.316H5.106M7.5 14.25L5.106 5.25M9.75 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm9 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
            <span className="hidden sm:inline">Cart</span>
          </Link>
        </div>

        <nav className="flex items-center gap-6 h-11 overflow-x-auto text-sm">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}`}
              className="whitespace-nowrap text-gray-600 hover:text-orange-600 font-medium"
            >
              {cat}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

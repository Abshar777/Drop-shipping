"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ADMIN_NAV, type AdminNavItem } from "@/lib/admin-nav";

/** Sidebar + top bar around every admin page. Sections collapse; the current page is highlighted. */
export default function AdminShell({ adminName, children }: { adminName: string; children: ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  const query = search.toString();
  const current = query ? `${pathname}?${query}` : pathname;

  const [open, setOpen] = useState<Set<string>>(
    () => new Set(ADMIN_NAV.filter((s) => s.items?.some((i) => i.href.split("?")[0] === pathname)).map((s) => s.id))
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(item: AdminNavItem) {
    if (current === item.href) return true;
    const [base, itemQuery] = item.href.split("?");
    if (itemQuery) return false;
    // Detail pages (e.g. /admin/customers/<id>) light up their list item.
    return !query && (pathname === base || pathname.startsWith(base + "/"));
  }

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex-1 overflow-y-auto px-2 py-3 text-sm">
      {ADMIN_NAV.map((section) => {
        if (!section.items) {
          const active = pathname === section.href;
          return (
            <Link
              key={section.id}
              href={section.href!}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md mb-0.5 font-medium ${
                active ? "bg-orange-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span aria-hidden="true">{section.emoji}</span>
              {section.label}
            </Link>
          );
        }
        const expanded = open.has(section.id);
        const containsActive = section.items.some(isActive);
        return (
          <div key={section.id} className="mb-0.5">
            <button
              onClick={() => toggle(section.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md font-medium ${
                containsActive ? "text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
              aria-expanded={expanded}
            >
              <span aria-hidden="true">{section.emoji}</span>
              <span className="flex-1 text-left">{section.label}</span>
              <span className="text-gray-500 text-xs">{expanded ? "▾" : "▸"}</span>
            </button>
            {expanded && (
              <ul className="ms-4 border-s border-gray-800 ps-2 py-1">
                {section.items.map((item) => {
                  const active = isActive(item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-[13px] ${
                          active ? "bg-orange-600/20 text-orange-300 font-medium" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.ready === false && (
                          <span className="text-[10px] uppercase tracking-wide text-gray-500">soon</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="px-4 py-4 border-b border-gray-800">
      <Link href="/admin" className="text-lg font-extrabold text-white tracking-tight">
        anyitems<span className="text-orange-500">.admin</span>
      </Link>
      <p className="text-xs text-gray-500 mt-0.5 truncate" title={adminName}>
        {adminName}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex" style={{ colorScheme: "light" }}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-gray-900 sticky top-0 h-screen">
        {brand}
        {nav}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <aside className="w-72 max-w-[85vw] flex flex-col bg-gray-900 h-full">
            {brand}
            {nav}
          </aside>
          <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="flex-1 bg-black/50" />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 h-14 flex items-center gap-3 px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden border border-gray-300 rounded-md px-2 py-1 text-sm"
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="flex-1" />
          <Link href="/" className="text-sm text-gray-600 hover:text-orange-600">
            View store ↗
          </Link>
          <button onClick={logout} className="text-sm border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50">
            Log out
          </button>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

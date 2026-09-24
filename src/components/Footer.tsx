import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n";
import HideOnAdmin from "@/components/HideOnAdmin";

export default async function Footer() {
  const { t } = await getT();

  return (
    <HideOnAdmin>
    <footer className="bg-footer text-footer-foreground mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-2">anyitems.in</h3>
          <p className="text-sm opacity-80">{t.footer.tagline}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-sm">{t.footer.shop}</h4>
          <ul className="space-y-1 text-sm opacity-80">
            <li><Link href="/products" className="hover:underline">{t.products.allProducts}</Link></li>
            <li><Link href="/cart" className="hover:underline">{t.common.cart}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-sm">{t.footer.support}</h4>
          <ul className="space-y-1 text-sm opacity-80">
            <li>{t.footer.email}</li>
            <li>{t.footer.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-footer-foreground/15 py-4 text-center text-xs opacity-60">
        {fmt(t.footer.rights, { year: new Date().getFullYear() })}
      </div>
    </footer>
    </HideOnAdmin>
  );
}

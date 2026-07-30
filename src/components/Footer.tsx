import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-2">anyitems.in</h3>
          <p className="text-sm text-gray-400">
            Quality products, delivered to your door. Shop the latest trending finds at unbeatable prices.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2 text-sm">Shop</h4>
          <ul className="space-y-1 text-sm">
            <li><Link href="/products" className="hover:text-white">All Products</Link></li>
            <li><Link href="/cart" className="hover:text-white">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2 text-sm">Support</h4>
          <ul className="space-y-1 text-sm">
            <li>Email: support@anyitems.in</li>
            <li>Mon-Sat, 9am - 7pm IST</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} anyitems.in. All rights reserved.
      </div>
    </footer>
  );
}

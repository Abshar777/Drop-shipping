"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  const cartRows = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { item, product } : null;
    })
    .filter((row): row is { item: (typeof items)[number]; product: Product } => row !== null);

  const subtotal = cartRows.reduce((sum, row) => sum + row.product.price * row.item.quantity, 0);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items }),
    });

    if (res.ok) {
      const order = await res.json();
      clearCart();
      router.push(`/order-confirmation?orderId=${order.id}`);
    } else {
      setSubmitting(false);
      alert("Something went wrong placing your order. Please try again.");
    }
  }

  if (cartRows.length === 0 && products.length > 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500">Add products before checking out.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="font-bold text-gray-900">Shipping Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              required
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              placeholder="Full Name"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <input
              required
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <textarea
              required
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Full Address"
              rows={3}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              required
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="City"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <input
              required
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="State"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <input
              required
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              placeholder="Pincode"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <h2 className="font-bold text-gray-900 mt-4">Payment Method</h2>
          <div className="border border-orange-300 bg-orange-50 rounded-md px-4 py-3 text-sm text-gray-700">
            Cash on Delivery (online payment via Razorpay coming soon)
          </div>

          <button
            type="submit"
            disabled={submitting || cartRows.length === 0}
            className="mt-4 bg-orange-600 text-white font-semibold py-3 rounded-md hover:bg-orange-700 disabled:opacity-50"
          >
            {submitting ? "Placing Order..." : `Place Order — ${formatPrice(subtotal)}`}
          </button>
        </form>

        <div className="bg-white border border-gray-200 rounded-lg p-5 h-fit">
          <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="flex flex-col gap-3 mb-4">
            {cartRows.map(({ item, product }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {product.name} × {item.quantity}
                </span>
                <span className="font-medium">{formatPrice(product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-4">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

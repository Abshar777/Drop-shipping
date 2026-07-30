import Link from "next/link";
import { getOrders } from "@/lib/orders";
import { getProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";

export default async function AdminOrdersPage() {
  const [orders, products] = await Promise.all([getOrders(), getProducts()]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin — Orders</h1>
        <Link href="/admin" className="text-sm text-orange-600 hover:underline">
          ← Back to Products
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-mono text-sm text-gray-500">{order.id}</p>
                  <p className="font-semibold text-gray-900">{order.customerName}</p>
                  <p className="text-sm text-gray-500">
                    {order.email} · {order.phone}
                  </p>
                </div>
                <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full capitalize">
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {order.address}, {order.city}, {order.state} - {order.pincode}
              </p>
              <div className="flex flex-col gap-1 mb-3">
                {order.items.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {product?.name || "Unknown product"} × {item.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleString("en-IN")}
                </span>
                <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

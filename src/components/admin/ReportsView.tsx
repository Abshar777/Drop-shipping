import Link from "next/link";
import { getSalesByDay, getProductSales, getInventoryValue } from "@/lib/admin-stats";
import { getCustomers } from "@/lib/customers";
import { formatPrice } from "@/lib/format";
import { PageHeader, Card, EmptyState } from "./ui";

export type ReportKind = "sales" | "products" | "customers" | "inventory";

function Bar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden min-w-[6rem]">
      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
    </div>
  );
}

async function SalesReport() {
  const days = await getSalesByDay(30);
  const totalRevenue = days.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = days.reduce((s, d) => s + d.orders, 0);
  const max = Math.max(...days.map((d) => d.revenue), 0);
  const best = days.reduce((a, b) => (b.revenue > a.revenue ? b : a), days[0]);

  return (
    <div>
      <PageHeader title="Sales Report" description="Revenue and orders per day for the last 30 days. Cancelled and refunded orders are excluded from revenue." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          ["Revenue (30 days)", formatPrice(totalRevenue)],
          ["Orders (30 days)", String(totalOrders)],
          ["Average order", totalOrders ? formatPrice(Math.round(totalRevenue / totalOrders)) : "—"],
          ["Best day", best?.revenue ? `${best.day} · ${formatPrice(best.revenue)}` : "—"],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
          </Card>
        ))}
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2">Day</th>
              <th className="px-4 py-2 text-right">Orders</th>
              <th className="px-4 py-2 text-right">Revenue</th>
              <th className="px-4 py-2 w-1/3"></th>
            </tr>
          </thead>
          <tbody>
            {[...days].reverse().map((d) => (
              <tr key={d.day} className="border-t border-gray-100">
                <td className="px-4 py-1.5 text-gray-700 whitespace-nowrap">{d.day}</td>
                <td className="px-4 py-1.5 text-right">{d.orders || ""}</td>
                <td className="px-4 py-1.5 text-right font-medium">{d.revenue ? formatPrice(d.revenue) : ""}</td>
                <td className="px-4 py-1.5">
                  <Bar value={d.revenue} max={max} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

async function ProductsReport() {
  const rows = await getProductSales();
  const max = Math.max(...rows.map((r) => r.revenue), 0);
  return (
    <div>
      <PageHeader title="Products Report" description="Units sold and revenue per product across all counted orders." />
      <Card className="overflow-x-auto">
        {rows.length === 0 ? (
          <EmptyState>No products yet.</EmptyState>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2 text-right">Units sold</th>
                <th className="px-4 py-2 text-right">Revenue</th>
                <th className="px-4 py-2 w-1/4"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ product, units, revenue }) => (
                <tr key={product.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 text-gray-900">{product.name}</td>
                  <td className="px-4 py-2 text-gray-600">{product.category}</td>
                  <td className="px-4 py-2 text-right">{units}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatPrice(revenue)}</td>
                  <td className="px-4 py-2">
                    <Bar value={revenue} max={max} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

async function CustomersReport() {
  const customers = (await getCustomers()).sort((a, b) => b.totalSpent - a.totalSpent);
  const max = Math.max(...customers.map((c) => c.totalSpent), 0);
  const registered = customers.filter((c) => c.registered).length;
  return (
    <div>
      <PageHeader title="Customers Report" description="Who buys the most, and how the customer base is made up." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          ["Customers", String(customers.length)],
          ["Registered", String(registered)],
          ["Guests", String(customers.length - registered)],
          ["Repeat buyers", String(customers.filter((c) => c.orderCount > 1).length)],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
          </Card>
        ))}
      </div>
      <Card className="overflow-x-auto">
        {customers.length === 0 ? (
          <EmptyState>No customers yet.</EmptyState>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2 text-right">Orders</th>
                <th className="px-4 py-2 text-right">Total spent</th>
                <th className="px-4 py-2 w-1/4"></th>
              </tr>
            </thead>
            <tbody>
              {customers.slice(0, 50).map((c) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="px-4 py-2">
                    <Link href={`/admin/customers/${encodeURIComponent(c.id)}`} className="text-gray-900 hover:text-orange-600">
                      {c.name}
                    </Link>
                    <div className="text-xs text-gray-500">{c.email}</div>
                  </td>
                  <td className="px-4 py-2 text-right">{c.orderCount}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatPrice(c.totalSpent)}</td>
                  <td className="px-4 py-2">
                    <Bar value={c.totalSpent} max={max} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

async function InventoryReport() {
  const { rows, total } = await getInventoryValue();
  const units = rows.reduce((s, r) => s + r.product.stock, 0);
  const max = Math.max(...rows.map((r) => r.value), 0);
  return (
    <div>
      <PageHeader title="Inventory Report" description="What the stock on hand is worth at selling price." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          ["Stock value", formatPrice(total)],
          ["Units in stock", String(units)],
          ["Products", String(rows.length)],
          ["Out of stock", String(rows.filter((r) => r.product.stock === 0).length)],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
          </Card>
        ))}
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2 text-right">In stock</th>
              <th className="px-4 py-2 text-right">Price</th>
              <th className="px-4 py-2 text-right">Value</th>
              <th className="px-4 py-2 w-1/4"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ product, value }) => (
              <tr key={product.id} className="border-t border-gray-100">
                <td className="px-4 py-2 text-gray-900">{product.name}</td>
                <td className="px-4 py-2 text-right">{product.stock}</td>
                <td className="px-4 py-2 text-right text-gray-600">{formatPrice(product.price)}</td>
                <td className="px-4 py-2 text-right font-medium">{formatPrice(value)}</td>
                <td className="px-4 py-2">
                  <Bar value={value} max={max} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default async function ReportsView({ kind }: { kind: ReportKind }) {
  if (kind === "sales") return <SalesReport />;
  if (kind === "products") return <ProductsReport />;
  if (kind === "customers") return <CustomersReport />;
  return <InventoryReport />;
}

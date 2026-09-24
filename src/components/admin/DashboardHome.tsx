import Link from "next/link";
import { getDashboardStats } from "@/lib/admin-stats";
import { LOW_STOCK_THRESHOLD } from "@/lib/inventory";
import { formatPrice } from "@/lib/format";
import { PageHeader, Card, StatusBadge, EmptyState, formatDate } from "./ui";

function Kpi({
  label,
  value,
  hint,
  href,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  href: string;
  tone?: "default" | "warn" | "danger" | "good";
}) {
  const tones = {
    default: "border-gray-200",
    warn: "border-amber-300 bg-amber-50",
    danger: "border-red-300 bg-red-50",
    good: "border-green-300 bg-green-50",
  };
  return (
    <Link href={href} className={`block bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow ${tones[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </Link>
  );
}

function delta(today: number, yesterday: number, money = false) {
  if (yesterday === 0) return today === 0 ? "Same as yesterday" : "No sales yesterday";
  const pct = Math.round(((today - yesterday) / yesterday) * 100);
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}% vs yesterday (${money ? formatPrice(yesterday) : yesterday})`;
}

export default async function DashboardHome({ adminName }: { adminName: string }) {
  const s = await getDashboardStats();

  return (
    <div>
      <PageHeader title="Dashboard" description={`Welcome back, ${adminName}. Here is how the store is doing today.`} />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <Kpi label="Sales today" value={formatPrice(s.salesToday)} hint={delta(s.salesToday, s.salesYesterday, true)} href="/admin/reports/sales" />
        <Kpi label="Orders today" value={String(s.ordersToday)} hint={delta(s.ordersToday, s.ordersYesterday)} href="/admin/orders" />
        <Kpi label="Customers" value={String(s.customers)} hint="Registered and guest buyers" href="/admin/customers" />
        <Kpi
          label="Pending orders"
          value={String(s.pendingOrders)}
          hint="Waiting to be processed"
          href="/admin/orders?status=pending"
          tone={s.pendingOrders > 0 ? "warn" : "default"}
        />
        <Kpi
          label="Low stock"
          value={String(s.lowStock.length)}
          hint={`${LOW_STOCK_THRESHOLD} or fewer left`}
          href="/admin/inventory?filter=low"
          tone={s.lowStock.length > 0 ? "danger" : "good"}
        />
        <Kpi label="Refunds" value={String(s.refunds.count)} hint={formatPrice(s.refunds.amount)} href="/admin/orders?status=refunded" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 overflow-x-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-orange-600 hover:underline">
              View all
            </Link>
          </div>
          {s.recentOrders.length === 0 ? (
            <EmptyState>No orders yet. They will appear here as customers check out.</EmptyState>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-2">Order</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {s.recentOrders.map((o) => (
                  <tr key={o.id} className="border-t border-gray-100">
                    <td className="px-4 py-2 font-mono text-xs text-gray-600">{o.id}</td>
                    <td className="px-4 py-2">
                      <div className="text-gray-900">{o.customerName}</div>
                      <div className="text-xs text-gray-500">{o.email}</div>
                    </td>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-2">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-2 text-right font-medium">{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Low stock</h2>
            <Link href="/admin/inventory/adjust" className="text-sm text-orange-600 hover:underline">
              Restock
            </Link>
          </div>
          {s.lowStock.length === 0 ? (
            <EmptyState>Every product has more than {LOW_STOCK_THRESHOLD} in stock.</EmptyState>
          ) : (
            <ul className="divide-y divide-gray-100">
              {s.lowStock.slice(0, 8).map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images[0]} alt="" className="w-9 h-9 rounded object-cover bg-gray-100" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.category}</p>
                  </div>
                  <span className={`text-sm font-semibold ${p.stock === 0 ? "text-red-600" : "text-amber-600"}`}>
                    {p.stock === 0 ? "Out" : `${p.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

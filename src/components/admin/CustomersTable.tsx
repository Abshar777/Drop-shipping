import Link from "next/link";
import { getCustomers, type CustomerStatus } from "@/lib/customers";
import { formatPrice } from "@/lib/format";
import { PageHeader, Card, EmptyState, formatDate } from "./ui";

const STATUS_STYLE: Record<CustomerStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  guest: "bg-gray-100 text-gray-700",
};

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[status]}`}>{status}</span>;
}

export default async function CustomersTable({ filter, hint }: { filter?: string; hint?: string }) {
  const all = await getCustomers();
  const rows = filter === "new" ? all.filter((c) => c.status === "new") : all;
  const title = filter === "new" ? "New Customers" : "All Customers";

  return (
    <div>
      <PageHeader
        title={title}
        description={
          filter === "new"
            ? "Accounts created in the last 30 days."
            : `${all.length} customers: registered accounts plus guests who checked out. Click a row for details.`
        }
      />
      {hint === "details" && (
        <p className="text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-md px-3 py-2 mb-4">
          Click any customer below to open their details: contact info, addresses, totals, and order history.
        </p>
      )}
      <Card className="overflow-x-auto">
        {rows.length === 0 ? (
          <EmptyState>{filter === "new" ? "No new customers in the last 30 days." : "No customers yet."}</EmptyState>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2 text-right">Orders</th>
                <th className="px-4 py-2 text-right">Total Spent</th>
                <th className="px-4 py-2">Last Order</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const href = `/admin/customers/${encodeURIComponent(c.id)}`;
                return (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-orange-50/40">
                    <td className="px-4 py-2">
                      <Link href={href} className="font-medium text-gray-900 hover:text-orange-600">
                        {c.name}
                      </Link>
                      {!c.registered && <span className="ms-2 text-[10px] uppercase tracking-wide text-gray-400">guest</span>}
                    </td>
                    <td className="px-4 py-2 text-gray-600">{c.email}</td>
                    <td className="px-4 py-2 text-right">{c.orderCount}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatPrice(c.totalSpent)}</td>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{c.lastOrderAt ? formatDate(c.lastOrderAt, false) : "—"}</td>
                    <td className="px-4 py-2">
                      <CustomerStatusBadge status={c.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

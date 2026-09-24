import { notFound } from "next/navigation";
import { getCustomerDetail, type CustomerAddress } from "@/lib/customers";
import { formatPrice } from "@/lib/format";
import { PageHeader, Card, StatusBadge, BackLink, EmptyState, formatDate } from "./ui";
import { CustomerStatusBadge } from "./CustomersTable";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className={`text-sm mt-0.5 ${value ? "text-gray-900" : "text-gray-400 italic"}`}>{value || "Not collected"}</dd>
    </div>
  );
}

function Address({ label, address }: { label: string; address?: CustomerAddress }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className={`text-sm mt-0.5 ${address ? "text-gray-900" : "text-gray-400 italic"}`}>
        {address ? (
          <>
            {address.address}
            <br />
            {address.city}, {address.state} {address.pincode}
          </>
        ) : (
          "No orders yet"
        )}
      </dd>
    </div>
  );
}

export default async function CustomerDetail({ id }: { id: string }) {
  const c = await getCustomerDetail(id);
  if (!c) notFound();

  const countedOrders = c.orders.filter((o) => o.status !== "cancelled" && o.status !== "refunded");

  return (
    <div>
      <BackLink href="/admin/customers">All customers</BackLink>
      <PageHeader
        title={c.name}
        description={c.registered ? `Customer since ${formatDate(c.createdAt!, false)}` : "Guest checkout, no account"}
        action={<CustomerStatusBadge status={c.status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">Customer details</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Name" value={c.name} />
            <Field label="Email" value={c.email} />
            <Field label="Phone" value={c.phone} />
            <Field label="Date of Birth" value={c.dateOfBirth} />
            <Address label="Billing Address" address={c.billingAddress} />
            <Address label="Shipping Address" address={c.shippingAddress} />
          </dl>
          {c.billingAddress && (
            <p className="text-xs text-gray-400 mt-3">Billing uses the address given at checkout, which is the same as shipping.</p>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">Totals</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs text-gray-500">Total orders</dt>
              <dd className="text-2xl font-bold text-gray-900">{countedOrders.length}</dd>
              {c.orders.length !== countedOrders.length && (
                <dd className="text-xs text-gray-500">{c.orders.length - countedOrders.length} cancelled or refunded</dd>
              )}
            </div>
            <div>
              <dt className="text-xs text-gray-500">Total spent</dt>
              <dd className="text-2xl font-bold text-gray-900">{formatPrice(c.totalSpent)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Average order</dt>
              <dd className="text-lg font-semibold text-gray-900">{countedOrders.length ? formatPrice(Math.round(c.totalSpent / countedOrders.length)) : "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Last order</dt>
              <dd className="text-sm text-gray-900">{c.lastOrderAt ? formatDate(c.lastOrderAt) : "—"}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className="overflow-x-auto">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Order history</h2>
        </div>
        {c.orders.length === 0 ? (
          <EmptyState>This customer has not placed an order yet.</EmptyState>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2 text-right">Items</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {c.orders.map((o) => (
                <tr key={o.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-mono text-xs text-gray-700">{o.id}</td>
                  <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-2 text-right">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatPrice(o.total)}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={o.status} />
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

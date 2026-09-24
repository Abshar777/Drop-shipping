import { getOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";
import { PageHeader, Card, EmptyState, formatDate } from "./ui";

type PayStatus = "paid" | "pending" | "failed" | "refunded";

/** Cash on Delivery: money arrives when the parcel is delivered. */
function paymentStatus(o: Order): PayStatus {
  if (o.status === "delivered") return "paid";
  if (o.status === "refunded") return "refunded";
  if (o.status === "cancelled") return "failed";
  return "pending";
}

const STYLE: Record<PayStatus, string> = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-gray-200 text-gray-700",
  refunded: "bg-red-100 text-red-800",
};

const LABEL: Record<PayStatus, string> = {
  paid: "Paid on delivery",
  pending: "Due on delivery",
  failed: "Cancelled",
  refunded: "Refunded",
};

const FILTERS: Record<string, { title: string; keep: PayStatus[] }> = {
  all: { title: "Transactions", keep: ["paid", "pending", "failed", "refunded"] },
  successful: { title: "Successful Payments", keep: ["paid"] },
  failed: { title: "Failed Payments", keep: ["failed"] },
  refunds: { title: "Refunds", keep: ["refunded"] },
};

export async function PaymentsTable({ status = "all" }: { status?: string }) {
  const orders = (await getOrders()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const filter = FILTERS[status] ?? FILTERS.all;
  const rows = orders.filter((o) => filter.keep.includes(paymentStatus(o)));

  return (
    <div>
      <PageHeader
        title={filter.title}
        description="All orders are paid by Cash on Delivery for now, so a payment completes when the order is marked delivered."
      />
      <Card className="overflow-x-auto">
        {rows.length === 0 ? (
          <EmptyState>No transactions here.</EmptyState>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Method</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2">Payment</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const s = paymentStatus(o);
                return (
                  <tr key={o.id} className="border-t border-gray-100">
                    <td className="px-4 py-2 font-mono text-xs text-gray-700">{o.id}</td>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-2">
                      <div className="text-gray-900">{o.customerName}</div>
                      <div className="text-xs text-gray-500">{o.email}</div>
                    </td>
                    <td className="px-4 py-2 text-gray-600">Cash on Delivery</td>
                    <td className="px-4 py-2 text-right font-medium">{formatPrice(o.total)}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STYLE[s]}`}>{LABEL[s]}</span>
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

export async function PaymentReports() {
  const orders = await getOrders();
  const sum = (list: Order[]) => list.reduce((s, o) => s + o.total, 0);
  const by = (s: PayStatus) => orders.filter((o) => paymentStatus(o) === s);
  const buckets: Array<{ label: string; status: PayStatus; hint: string }> = [
    { label: "Collected", status: "paid", hint: "Delivered orders" },
    { label: "Due on delivery", status: "pending", hint: "Pending, processing, shipped" },
    { label: "Refunded", status: "refunded", hint: "Money returned" },
    { label: "Cancelled", status: "failed", hint: "Never collected" },
  ];

  return (
    <div>
      <PageHeader title="Payment Reports" description="Totals by payment outcome, across all orders." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {buckets.map((b) => {
          const list = by(b.status);
          return (
            <Card key={b.status} className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{b.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatPrice(sum(list))}</p>
              <p className="text-xs text-gray-500 mt-1">
                {list.length} order{list.length === 1 ? "" : "s"} · {b.hint}
              </p>
            </Card>
          );
        })}
      </div>
      <Card className="p-5">
        <h2 className="font-semibold text-gray-900 mb-3">By payment method</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500">
            <tr>
              <th className="py-1">Method</th>
              <th className="py-1 text-right">Orders</th>
              <th className="py-1 text-right">Collected</th>
              <th className="py-1 text-right">Due</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-100">
              <td className="py-2">Cash on Delivery</td>
              <td className="py-2 text-right">{orders.length}</td>
              <td className="py-2 text-right font-medium">{formatPrice(sum(by("paid")))}</td>
              <td className="py-2 text-right">{formatPrice(sum(by("pending")))}</td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-gray-500 mt-3">Online payments (Razorpay) will appear here as a second row once enabled in Settings → Payment Settings.</p>
      </Card>
    </div>
  );
}

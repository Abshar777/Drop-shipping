import { getInventoryLog } from "@/lib/inventory";
import { PageHeader, Card, EmptyState, formatDate } from "./ui";

export default async function InventoryHistory() {
  const log = await getInventoryLog();
  return (
    <div>
      <PageHeader title="Inventory History" description="Every stock movement: orders placed, cancellations, and manual adjustments." />
      <Card className="overflow-x-auto">
        {log.length === 0 ? (
          <EmptyState>No stock movements recorded yet. New orders and adjustments will appear here.</EmptyState>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2">When</th>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2 text-right">Change</th>
                <th className="px-4 py-2 text-right">Before → After</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2">By</th>
              </tr>
            </thead>
            <tbody>
              {log.map((e) => (
                <tr key={e.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{formatDate(e.at)}</td>
                  <td className="px-4 py-2 text-gray-900">{e.productName}</td>
                  <td className={`px-4 py-2 text-right font-semibold ${e.delta > 0 ? "text-green-700" : "text-red-600"}`}>
                    {e.delta > 0 ? `+${e.delta}` : e.delta}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">
                    {e.before} → {e.after}
                  </td>
                  <td className="px-4 py-2 text-gray-700">{e.reason}</td>
                  <td className="px-4 py-2 text-gray-500 text-xs">{e.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

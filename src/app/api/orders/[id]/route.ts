import { NextResponse } from "next/server";
import { getOrders, saveOrders } from "@/lib/orders";
import { adjustStock } from "@/lib/inventory";
import { getAdminSession } from "@/lib/require-admin";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";

const RELEASES_STOCK = new Set<OrderStatus>(["cancelled", "refunded"]);

/** PATCH /api/orders/:id  { status }  (admin only). Cancelling or refunding puts the stock back. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const status = body.status as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Unknown status" }, { status: 400 });
  }

  const orders = await getOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const wasReleased = RELEASES_STOCK.has(order.status);
  const willRelease = RELEASES_STOCK.has(status);
  order.status = status;
  await saveOrders(orders);

  if (!wasReleased && willRelease) {
    await adjustStock(order.items.map((i) => ({ productId: i.productId, delta: i.quantity })), `${status === "refunded" ? "Refunded" : "Cancelled"} ${order.id}`, admin.email);
  } else if (wasReleased && !willRelease) {
    await adjustStock(order.items.map((i) => ({ productId: i.productId, delta: -i.quantity })), `Reopened ${order.id}`, admin.email);
  }

  return NextResponse.json(order);
}

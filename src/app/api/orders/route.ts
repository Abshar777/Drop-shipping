import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { addOrder, getOrders } from "@/lib/orders";
import { getProductById } from "@/lib/products";
import { adjustStock } from "@/lib/inventory";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { getSubjectId } from "@/lib/session-store";
import { CUSTOMER_COOKIE, CUSTOMER_SESSION_FILE } from "@/lib/auth-constants";
import type { Order } from "@/lib/types";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await getOrders();
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const body = await request.json();
  const items: Array<{ productId: string; quantity: number }> = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    return NextResponse.json({ error: "The cart is empty" }, { status: 400 });
  }

  let total = 0;
  for (const item of items) {
    const product = await getProductById(item.productId);
    if (product) total += product.price * item.quantity;
  }

  // Link the order to the customer account when they are signed in.
  const cookieStore = await cookies();
  const userId = await getSubjectId(CUSTOMER_SESSION_FILE, cookieStore.get(CUSTOMER_COOKIE)?.value);

  const order: Order = {
    id: `ORD${Date.now()}`,
    items,
    total,
    customerName: body.customerName,
    email: body.email,
    phone: body.phone,
    address: body.address,
    city: body.city,
    state: body.state,
    pincode: body.pincode,
    createdAt: new Date().toISOString(),
    status: "pending",
    userId: userId ?? undefined,
    paymentMethod: "cod",
  };

  await addOrder(order);
  // Reserve the stock and record it in the inventory history.
  await adjustStock(
    items.map((i) => ({ productId: i.productId, delta: -Math.max(1, Number(i.quantity) || 1) })),
    `Order ${order.id}`,
    order.email
  );
  return NextResponse.json(order, { status: 201 });
}

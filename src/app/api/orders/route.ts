import { NextResponse } from "next/server";
import { addOrder, getOrders } from "@/lib/orders";
import { getProductById } from "@/lib/products";
import type { Order } from "@/lib/types";

export async function GET() {
  const orders = await getOrders();
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const body = await request.json();

  let total = 0;
  for (const item of body.items) {
    const product = await getProductById(item.productId);
    if (product) total += product.price * item.quantity;
  }

  const order: Order = {
    id: `ORD${Date.now()}`,
    items: body.items,
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
  };

  await addOrder(order);
  return NextResponse.json(order, { status: 201 });
}

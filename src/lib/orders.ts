import fs from "fs/promises";
import path from "path";
import type { Order } from "./types";

const ORDERS_PATH = path.join(process.cwd(), "data", "orders.json");

export async function getOrders(): Promise<Order[]> {
  try {
    const raw = await fs.readFile(ORDERS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function addOrder(order: Order): Promise<void> {
  const orders = await getOrders();
  orders.unshift(order);
  await fs.writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2), "utf-8");
}

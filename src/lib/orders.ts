import { readJson, writeJson } from "./storage";
import type { Order } from "./types";

const ORDERS_FILE = "orders.json";

export async function getOrders(): Promise<Order[]> {
  try {
    return await readJson<Order[]>(ORDERS_FILE, []);
  } catch {
    return [];
  }
}

export async function saveOrders(orders: Order[]): Promise<void> {
  await writeJson(ORDERS_FILE, orders);
}

export async function addOrder(order: Order): Promise<void> {
  const orders = await getOrders();
  orders.unshift(order);
  await saveOrders(orders);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const orders = await getOrders();
  return orders.find((o) => o.id === id);
}

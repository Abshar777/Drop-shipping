import { getOrders } from "./orders";
import { getProducts } from "./products";
import { getCustomers } from "./customers";
import { isLowStock } from "./product-utils";
import type { Order, Product } from "./types";

const REVENUE_STATUSES = new Set(["pending", "processing", "shipped", "delivered"]);

export function countsTowardsRevenue(order: Order) {
  return REVENUE_STATUSES.has(order.status);
}

/** YYYY-MM-DD in the server's local time zone. */
export function dayKey(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export type DashboardStats = {
  salesToday: number;
  ordersToday: number;
  customers: number;
  pendingOrders: number;
  lowStock: Product[];
  refunds: { count: number; amount: number };
  recentOrders: Order[];
  salesYesterday: number;
  ordersYesterday: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [orders, products, customers] = await Promise.all([getOrders(), getProducts(), getCustomers()]);
  const today = dayKey(new Date());
  const yesterday = dayKey(new Date(Date.now() - 24 * 60 * 60 * 1000));

  const ofDay = (day: string) => orders.filter((o) => dayKey(o.createdAt) === day);
  const revenue = (list: Order[]) => list.filter(countsTowardsRevenue).reduce((s, o) => s + o.total, 0);
  const todays = ofDay(today);
  const yesterdays = ofDay(yesterday);
  const refunded = orders.filter((o) => o.status === "refunded");

  return {
    salesToday: revenue(todays),
    ordersToday: todays.length,
    salesYesterday: revenue(yesterdays),
    ordersYesterday: yesterdays.length,
    customers: customers.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    lowStock: products.filter(isLowStock).sort((a, b) => a.stock - b.stock),
    refunds: { count: refunded.length, amount: refunded.reduce((s, o) => s + o.total, 0) },
    recentOrders: [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8),
  };
}

export type SalesDay = { day: string; orders: number; revenue: number };

/** Revenue and order counts per day for the last `days` days, oldest first. */
export async function getSalesByDay(days = 30): Promise<SalesDay[]> {
  const orders = await getOrders();
  const out: SalesDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = dayKey(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
    const list = orders.filter((o) => dayKey(o.createdAt) === day);
    out.push({
      day,
      orders: list.length,
      revenue: list.filter(countsTowardsRevenue).reduce((s, o) => s + o.total, 0),
    });
  }
  return out;
}

export type ProductSales = { product: Product; units: number; revenue: number };

export async function getProductSales(): Promise<ProductSales[]> {
  const [orders, products] = await Promise.all([getOrders(), getProducts()]);
  const totals = new Map<string, { units: number; revenue: number }>();
  for (const o of orders) {
    if (!countsTowardsRevenue(o)) continue;
    for (const item of o.items) {
      const product = products.find((p) => p.id === item.productId);
      const t = totals.get(item.productId) ?? { units: 0, revenue: 0 };
      t.units += item.quantity;
      t.revenue += (product?.price ?? 0) * item.quantity;
      totals.set(item.productId, t);
    }
  }
  return products
    .map((product) => ({ product, ...(totals.get(product.id) ?? { units: 0, revenue: 0 }) }))
    .sort((a, b) => b.revenue - a.revenue);
}

/** Retail value of everything in stock, by product. */
export async function getInventoryValue() {
  const products = await getProducts();
  const rows = products.map((p) => ({ product: p, value: p.stock * p.price }));
  return { rows: rows.sort((a, b) => b.value - a.value), total: rows.reduce((s, r) => s + r.value, 0) };
}

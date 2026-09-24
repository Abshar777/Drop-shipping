import { getUsers } from "./users";
import { getOrders } from "./orders";
import type { Order } from "./types";

const NEW_CUSTOMER_DAYS = 30;
const COUNTED_STATUSES = new Set(["pending", "processing", "shipped", "delivered"]);

export type CustomerStatus = "new" | "active" | "guest";

export type CustomerSummary = {
  /** User id for registered customers, "guest:<email>" for checkout-only ones. */
  id: string;
  name: string;
  email: string;
  phone?: string;
  registered: boolean;
  createdAt?: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt?: string;
  status: CustomerStatus;
};

export type CustomerAddress = { address: string; city: string; state: string; pincode: string };

export type CustomerDetail = CustomerSummary & {
  dateOfBirth?: string;
  shippingAddress?: CustomerAddress;
  billingAddress?: CustomerAddress;
  orders: Order[];
};

const key = (email: string) => email.trim().toLowerCase();

/** Orders that count towards spend: everything except cancelled and refunded. */
function counted(order: Order) {
  return COUNTED_STATUSES.has(order.status);
}

function summarise(orders: Order[]) {
  const sorted = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const spent = sorted.filter(counted).reduce((sum, o) => sum + o.total, 0);
  return { sorted, spent, last: sorted[0] };
}

/** Registered customers merged with guest buyers, one row per email. */
export async function getCustomers(): Promise<CustomerSummary[]> {
  const [users, orders] = await Promise.all([getUsers(), getOrders()]);
  const byEmail = new Map<string, Order[]>();
  for (const o of orders) {
    const k = key(o.email);
    byEmail.set(k, [...(byEmail.get(k) ?? []), o]);
  }

  const cutoff = Date.now() - NEW_CUSTOMER_DAYS * 24 * 60 * 60 * 1000;
  const rows: CustomerSummary[] = [];
  const seen = new Set<string>();

  for (const u of users) {
    const k = key(u.email);
    seen.add(k);
    const { sorted, spent, last } = summarise(byEmail.get(k) ?? []);
    rows.push({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: last?.phone,
      registered: true,
      createdAt: u.createdAt,
      orderCount: sorted.length,
      totalSpent: spent,
      lastOrderAt: last?.createdAt,
      status: new Date(u.createdAt).getTime() >= cutoff ? "new" : "active",
    });
  }

  for (const [k, list] of byEmail) {
    if (seen.has(k)) continue;
    const { sorted, spent, last } = summarise(list);
    const oldest = sorted[sorted.length - 1];
    rows.push({
      id: `guest:${k}`,
      name: last.customerName,
      email: last.email,
      phone: last.phone,
      registered: false,
      createdAt: oldest.createdAt,
      orderCount: sorted.length,
      totalSpent: spent,
      lastOrderAt: last.createdAt,
      status: "guest",
    });
  }

  return rows.sort((a, b) => (b.lastOrderAt ?? b.createdAt ?? "").localeCompare(a.lastOrderAt ?? a.createdAt ?? ""));
}

export async function getCustomerDetail(id: string): Promise<CustomerDetail | undefined> {
  const customers = await getCustomers();
  const summary = customers.find((c) => c.id === id);
  if (!summary) return undefined;

  const orders = (await getOrders())
    .filter((o) => key(o.email) === key(summary.email))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const last = orders[0];
  const shippingAddress = last
    ? { address: last.address, city: last.city, state: last.state, pincode: last.pincode }
    : undefined;

  return {
    ...summary,
    // Not collected at signup or checkout yet; shown as such in the admin.
    dateOfBirth: undefined,
    shippingAddress,
    // Checkout collects one address, used for both.
    billingAddress: shippingAddress,
    orders,
  };
}

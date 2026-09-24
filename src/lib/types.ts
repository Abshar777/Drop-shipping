/** Which product page design a product uses. */
export type ProductLayout = "default" | "amazon" | "flipkart";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  /** Id in data/categories.json. `category` above is the display name derived from it. */
  categoryId?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  description: string;
  /** Product page design; omitted = store theme. */
  layout?: ProductLayout;
  /** Physical goods are shipped; digital ones are delivered as files. Omitted = physical. */
  type?: "physical" | "digital";
  rating: number;
  reviewCount: number;
  stock: number;
  tags?: string[];
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
  status: OrderStatus;
  /** Set when a signed-in customer placed the order. */
  userId?: string;
  paymentMethod?: "cod";
};

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type PublicUser = Omit<User, "passwordHash">;

export type Admin = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

export type Category = {
  id: string;
  name: string;
  parentId: string | null;
  enabled: boolean;
  order: number;
  /** Where the entry came from: your own store, or a catalogue imported for reference. */
  source?: "store" | "meesho" | "noon";
  /** Icon shown in the category bar. Omitted = guessed from the name (see lib/category-icons). */
  icon?: string;
};

/** One stock movement, for the inventory history. */
export type InventoryEntry = {
  id: string;
  productId: string;
  productName: string;
  delta: number;
  before: number;
  after: number;
  reason: string;
  by: string;
  at: string;
};

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
  rating: number;
  reviewCount: number;
  stock: number;
  tags?: string[];
};

export type CartItem = {
  productId: string;
  quantity: number;
};

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
  status: "pending" | "processing" | "shipped" | "delivered";
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

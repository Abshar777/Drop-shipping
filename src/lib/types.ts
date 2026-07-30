export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
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

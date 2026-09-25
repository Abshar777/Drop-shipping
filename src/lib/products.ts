import { readJson, writeJson } from "./storage";
import type { Product } from "./types";

const PRODUCTS_FILE = "products.json";

export async function getProducts(): Promise<Product[]> {
  return readJson<Product[]>(PRODUCTS_FILE, []);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.id === id);
}

export async function saveProducts(products: Product[]): Promise<void> {
  await writeJson(PRODUCTS_FILE, products);
}

export async function getCategories(): Promise<string[]> {
  const products = await getProducts();
  return Array.from(new Set(products.map((p) => p.category))).sort();
}

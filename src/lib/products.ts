import fs from "fs/promises";
import path from "path";
import type { Product } from "./types";

const PRODUCTS_PATH = path.join(process.cwd(), "data", "products.json");

export async function getProducts(): Promise<Product[]> {
  const raw = await fs.readFile(PRODUCTS_PATH, "utf-8");
  return JSON.parse(raw);
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
  await fs.writeFile(PRODUCTS_PATH, JSON.stringify(products, null, 2), "utf-8");
}

export async function getCategories(): Promise<string[]> {
  const products = await getProducts();
  return Array.from(new Set(products.map((p) => p.category))).sort();
}

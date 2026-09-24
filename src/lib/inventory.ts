import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getProducts, saveProducts } from "./products";
import type { InventoryEntry, Product } from "./types";

const LOG_PATH = path.join(process.cwd(), "data", "inventory-log.json");

/** Products at or below this stock count as "low stock" across the admin. */
export const LOW_STOCK_THRESHOLD = 5;

export async function getInventoryLog(): Promise<InventoryEntry[]> {
  try {
    const raw = await fs.readFile(LOG_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function appendLog(entries: InventoryEntry[]): Promise<void> {
  if (entries.length === 0) return;
  const log = await getInventoryLog();
  log.unshift(...entries);
  await fs.writeFile(LOG_PATH, JSON.stringify(log.slice(0, 2000), null, 2) + "\n", "utf-8");
}

export type StockChange = { productId: string; delta: number };

/**
 * Apply stock changes to products (never below zero) and record them in the history.
 * Returns the updated products for the ids that were found.
 */
export async function adjustStock(changes: StockChange[], reason: string, by: string): Promise<Product[]> {
  const products = await getProducts();
  const entries: InventoryEntry[] = [];
  const touched: Product[] = [];
  const at = new Date().toISOString();

  for (const change of changes) {
    if (!Number.isFinite(change.delta) || change.delta === 0) continue;
    const product = products.find((p) => p.id === change.productId);
    if (!product) continue;
    const before = product.stock;
    const after = Math.max(0, before + change.delta);
    if (after === before) continue;
    product.stock = after;
    touched.push(product);
    entries.push({
      id: `inv${Date.now()}${crypto.randomBytes(2).toString("hex")}`,
      productId: product.id,
      productName: product.name,
      delta: after - before,
      before,
      after,
      reason,
      by,
      at,
    });
  }

  if (touched.length) {
    await saveProducts(products);
    await appendLog(entries);
  }
  return touched;
}

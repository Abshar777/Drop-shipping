import { readJson, writeJson } from "./storage";
import type { Category } from "./types";

const CATEGORIES_FILE = "categories.json";

export async function getCategories(): Promise<Category[]> {
  try {
    const list = await readJson<Category[]>(CATEGORIES_FILE, []);
    return list.sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await writeJson(CATEGORIES_FILE, categories);
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((c) => c.id === id);
}

export function slugifyCategory(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Unique id for a new category: parent id prefix + slug, with a numeric suffix on collision. */
export function nextCategoryId(existing: Category[], name: string, parentId: string | null): string {
  const base = parentId ? `${parentId}-${slugifyCategory(name)}` : slugifyCategory(name);
  const taken = new Set(existing.map((c) => c.id));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

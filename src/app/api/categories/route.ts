import { NextResponse } from "next/server";
import { getCategories, saveCategories, nextCategoryId } from "@/lib/categories";
import { buildCategoryTree } from "@/lib/category-tree";
import { isAdminAuthenticated } from "@/lib/require-admin";
import type { Category } from "@/lib/types";

/**
 * GET /api/categories        -> { tree }        enabled categories only, nested (public, used by storefront)
 * GET /api/categories?all=1  -> { categories }  every category, flat (admin only)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categories = await getCategories();

  if (searchParams.get("all") === "1") {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ categories });
  }

  return NextResponse.json({ tree: buildCategoryTree(categories, { enabledOnly: true }) });
}

/** POST /api/categories  { name, parentId? }  -> creates an enabled category (admin only) */
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const parentId = typeof body.parentId === "string" && body.parentId ? body.parentId : null;

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const categories = await getCategories();
  if (parentId && !categories.some((c) => c.id === parentId)) {
    return NextResponse.json({ error: "Parent category not found" }, { status: 400 });
  }
  const duplicate = categories.some(
    (c) => c.parentId === parentId && c.name.toLowerCase() === name.toLowerCase()
  );
  if (duplicate) {
    return NextResponse.json({ error: "A category with that name already exists here" }, { status: 409 });
  }

  const siblings = categories.filter((c) => c.parentId === parentId);
  const category: Category = {
    id: nextCategoryId(categories, name, parentId),
    name,
    parentId,
    enabled: body.enabled === undefined ? true : Boolean(body.enabled),
    order: siblings.length ? Math.max(...siblings.map((s) => s.order)) + 1 : categories.length,
  };

  categories.push(category);
  await saveCategories(categories);
  return NextResponse.json(category, { status: 201 });
}

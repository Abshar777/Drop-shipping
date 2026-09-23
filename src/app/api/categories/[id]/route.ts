import { NextResponse } from "next/server";
import { getCategories, saveCategories } from "@/lib/categories";
import { descendantIds } from "@/lib/category-tree";
import { isCategoryIcon } from "@/lib/category-icons";
import { getProducts } from "@/lib/products";
import { isAdminAuthenticated } from "@/lib/require-admin";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/categories/:id  { name?, enabled?, parentId?, cascade? }  (admin only)
 * With cascade: true, an enabled change is applied to every subcategory as well.
 */
export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const categories = await getCategories();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  const current = categories[index];

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    current.name = name;
  }

  if (body.icon !== undefined) {
    // Empty string clears the choice so the icon is guessed from the name again.
    if (body.icon === "" || body.icon === null) delete current.icon;
    else if (isCategoryIcon(body.icon)) current.icon = body.icon;
    else return NextResponse.json({ error: "Unknown icon" }, { status: 400 });
  }

  if (body.enabled !== undefined) {
    const enabled = Boolean(body.enabled);
    current.enabled = enabled;
    if (body.cascade) {
      const ids = descendantIds(categories, id);
      for (const c of categories) if (ids.has(c.id)) c.enabled = enabled;
    }
  }

  if (body.parentId !== undefined) {
    const parentId = body.parentId ? String(body.parentId) : null;
    if (parentId) {
      if (!categories.some((c) => c.id === parentId)) {
        return NextResponse.json({ error: "Parent category not found" }, { status: 400 });
      }
      if (descendantIds(categories, id).has(parentId)) {
        return NextResponse.json({ error: "A category cannot be moved under itself" }, { status: 400 });
      }
    }
    current.parentId = parentId;
  }

  categories[index] = current;
  await saveCategories(categories);
  return NextResponse.json(current);
}

/**
 * DELETE /api/categories/:id  (admin only)
 * Removes the category and all its subcategories. Refused if any product is assigned to them.
 */
export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const categories = await getCategories();
  if (!categories.some((c) => c.id === id)) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const toRemove = descendantIds(categories, id);
  const products = await getProducts();
  const inUse = products.filter((p) => p.categoryId && toRemove.has(p.categoryId)).length;
  if (inUse > 0) {
    return NextResponse.json(
      {
        error: `${inUse} product${inUse === 1 ? " is" : "s are"} assigned to this category or its subcategories. Move them first.`,
      },
      { status: 409 }
    );
  }

  await saveCategories(categories.filter((c) => !toRemove.has(c.id)));
  return NextResponse.json({ success: true, removed: toRemove.size });
}

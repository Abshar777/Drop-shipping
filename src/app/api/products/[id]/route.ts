import { NextResponse } from "next/server";
import { getProducts, saveProducts } from "@/lib/products";
import { getCategoryById } from "@/lib/categories";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { parseProductInput, uniqueSlug } from "@/lib/product-input";
import type { Product } from "@/lib/types";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const products = await getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  const current = products[index];

  // If a categoryId is supplied, the display name follows the category tree.
  let categoryFields: { category?: string; categoryId?: string } = {};
  if (body.categoryId !== undefined) {
    if (body.categoryId) {
      const category = await getCategoryById(String(body.categoryId));
      if (!category) return NextResponse.json({ error: "Category not found" }, { status: 400 });
      categoryFields = { category: category.name, categoryId: category.id };
    } else {
      categoryFields = { categoryId: undefined };
    }
  }

  const parsed = parseProductInput(body, current);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const updated: Product = {
    ...current,
    ...categoryFields,
    ...parsed.fields,
    slug: uniqueSlug(parsed.fields.slug, products, current.id),
  };

  products[index] = updated;
  await saveProducts(products);
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const products = await getProducts();
  const filtered = products.filter((p) => p.id !== id);

  if (filtered.length === products.length) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await saveProducts(filtered);
  return NextResponse.json({ success: true });
}

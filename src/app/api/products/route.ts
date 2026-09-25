import { NextResponse } from "next/server";
import { getProducts, saveProducts } from "@/lib/products";
import { getCategoryById } from "@/lib/categories";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { parseProductInput, uniqueSlug } from "@/lib/product-input";
import type { Product } from "@/lib/types";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Category: prefer a categoryId from the category tree; the display name is derived from it.
  let categoryId: string | undefined;
  let categoryName = typeof body.category === "string" ? body.category : "";
  if (body.categoryId) {
    const category = await getCategoryById(String(body.categoryId));
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 400 });
    categoryId = category.id;
    categoryName = category.name;
  }
  if (!categoryName) return NextResponse.json({ error: "Category is required" }, { status: 400 });

  const parsed = parseProductInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const products = await getProducts();
  const newProduct: Product = {
    id: `p${Date.now()}`,
    category: categoryName,
    categoryId,
    rating: 0,
    reviewCount: 0,
    ...parsed.fields,
    slug: uniqueSlug(parsed.fields.slug, products),
  };

  products.push(newProduct);
  await saveProducts(products);
  return NextResponse.json(newProduct, { status: 201 });
}

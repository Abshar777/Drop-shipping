import { NextResponse } from "next/server";
import { getProducts, saveProducts } from "@/lib/products";
import { getCategoryById } from "@/lib/categories";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { sanitizeHtml } from "@/lib/html";
import { isProductLayout } from "@/lib/product-layouts";
import type { Product } from "@/lib/types";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const products = await getProducts();

  // Category: prefer a categoryId from the category tree; the display name is derived from it.
  let categoryId: string | undefined;
  let categoryName: string = typeof body.category === "string" ? body.category : "";
  if (body.categoryId) {
    const category = await getCategoryById(String(body.categoryId));
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 400 });
    categoryId = category.id;
    categoryName = category.name;
  }
  if (!categoryName) return NextResponse.json({ error: "Category is required" }, { status: 400 });

  const slug = body.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const newProduct: Product = {
    id: `p${Date.now()}`,
    slug,
    name: body.name,
    category: categoryName,
    categoryId,
    price: Number(body.price),
    compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : undefined,
    images: body.images?.length ? body.images : ["https://picsum.photos/seed/" + slug + "/600/600"],
    description: sanitizeHtml(typeof body.description === "string" ? body.description : ""),
    layout: isProductLayout(body.layout) && body.layout !== "default" ? body.layout : undefined,
    type: body.type === "digital" ? "digital" : undefined,
    rating: 0,
    reviewCount: 0,
    stock: Number(body.stock) || 0,
    tags: body.tags || [],
  };

  products.push(newProduct);
  await saveProducts(products);
  return NextResponse.json(newProduct, { status: 201 });
}

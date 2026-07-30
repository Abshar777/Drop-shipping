import { NextResponse } from "next/server";
import { getProducts, saveProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();
  const products = await getProducts();

  const slug = body.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const newProduct: Product = {
    id: `p${Date.now()}`,
    slug,
    name: body.name,
    category: body.category,
    price: Number(body.price),
    compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : undefined,
    images: body.images?.length ? body.images : ["https://picsum.photos/seed/" + slug + "/600/600"],
    description: body.description || "",
    rating: 0,
    reviewCount: 0,
    stock: Number(body.stock) || 0,
    tags: body.tags || [],
  };

  products.push(newProduct);
  await saveProducts(products);
  return NextResponse.json(newProduct, { status: 201 });
}

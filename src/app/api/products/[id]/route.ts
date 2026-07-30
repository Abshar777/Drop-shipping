import { NextResponse } from "next/server";
import { getProducts, saveProducts } from "@/lib/products";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const products = await getProducts();
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  products[index] = {
    ...products[index],
    ...body,
    price: body.price !== undefined ? Number(body.price) : products[index].price,
    compareAtPrice:
      body.compareAtPrice !== undefined ? Number(body.compareAtPrice) : products[index].compareAtPrice,
    stock: body.stock !== undefined ? Number(body.stock) : products[index].stock,
  };

  await saveProducts(products);
  return NextResponse.json(products[index]);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = await getProducts();
  const filtered = products.filter((p) => p.id !== id);

  if (filtered.length === products.length) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await saveProducts(filtered);
  return NextResponse.json({ success: true });
}

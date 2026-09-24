import { NextResponse } from "next/server";
import { adjustStock, getInventoryLog } from "@/lib/inventory";
import { getAdminSession } from "@/lib/require-admin";

/** GET /api/inventory -> { log }  (admin only) */
export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ log: await getInventoryLog() });
}

/** POST /api/inventory  { productId, delta, reason? }  -> updated product  (admin only) */
export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const delta = Number(body.delta);
  if (!body.productId || !Number.isFinite(delta) || delta === 0) {
    return NextResponse.json({ error: "Give a product and a non-zero quantity change" }, { status: 400 });
  }
  const reason = typeof body.reason === "string" && body.reason.trim() ? body.reason.trim() : "Manual adjustment";

  const [product] = await adjustStock([{ productId: String(body.productId), delta }], reason, admin.email);
  if (!product) return NextResponse.json({ error: "Product not found, or stock already at zero" }, { status: 404 });
  return NextResponse.json(product);
}

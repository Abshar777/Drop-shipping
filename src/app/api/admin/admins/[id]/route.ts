import { NextResponse } from "next/server";
import { getAdmins, saveAdmins } from "@/lib/admins";
import { getAdminSession } from "@/lib/require-admin";

/** DELETE /api/admin/admins/:id  (admin only). You cannot remove yourself or the last admin. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const current = await getAdminSession();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (id === current.id) {
    return NextResponse.json({ error: "You cannot remove your own admin access" }, { status: 400 });
  }

  const admins = await getAdmins();
  if (!admins.some((a) => a.id === id)) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }
  if (admins.length <= 1) {
    return NextResponse.json({ error: "The store must keep at least one admin" }, { status: 400 });
  }

  await saveAdmins(admins.filter((a) => a.id !== id));
  return NextResponse.json({ success: true });
}

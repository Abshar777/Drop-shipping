import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroySession } from "@/lib/session-store";
import { ADMIN_SESSION_FILE, ADMIN_COOKIE } from "@/lib/auth-constants";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  await destroySession(ADMIN_SESSION_FILE, token);
  cookieStore.delete(ADMIN_COOKIE);
  return NextResponse.json({ success: true });
}

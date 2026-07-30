import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroySession } from "@/lib/session-store";
import { CUSTOMER_SESSION_FILE, CUSTOMER_COOKIE } from "@/lib/auth-constants";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE)?.value;
  await destroySession(CUSTOMER_SESSION_FILE, token);
  cookieStore.delete(CUSTOMER_COOKIE);
  return NextResponse.json({ success: true });
}

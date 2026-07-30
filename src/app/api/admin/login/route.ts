import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findAdminByEmail } from "@/lib/admins";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session-store";
import { ADMIN_SESSION_FILE, ADMIN_COOKIE, SESSION_MAX_AGE } from "@/lib/auth-constants";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const admin = await findAdminByEmail(email || "");

  if (!admin || !(await verifyPassword(password || "", admin.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createSession(ADMIN_SESSION_FILE, admin.id);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return NextResponse.json({ id: admin.id, name: admin.name, email: admin.email });
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserByEmail } from "@/lib/users";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session-store";
import { CUSTOMER_SESSION_FILE, CUSTOMER_COOKIE, SESSION_MAX_AGE } from "@/lib/auth-constants";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const user = await findUserByEmail(email || "");

  if (!user || !(await verifyPassword(password || "", user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createSession(CUSTOMER_SESSION_FILE, user.id);
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUsers, saveUsers, findUserByEmail } from "@/lib/users";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session-store";
import { CUSTOMER_SESSION_FILE, CUSTOMER_COOKIE, SESSION_MAX_AGE } from "@/lib/auth-constants";
import type { User } from "@/lib/types";

export async function POST(request: Request) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const users = await getUsers();
  const user: User = {
    id: `u${Date.now()}`,
    name,
    email,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await saveUsers(users);

  const token = await createSession(CUSTOMER_SESSION_FILE, user.id);
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
}

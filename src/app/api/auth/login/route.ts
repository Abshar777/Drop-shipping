import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserByEmail } from "@/lib/users";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session-store";
import { CUSTOMER_SESSION_FILE, CUSTOMER_COOKIE, SESSION_MAX_AGE } from "@/lib/auth-constants";
import { AUTH_MESSAGES, type AuthErrorCode, type AuthField } from "@/lib/auth-validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { storeIsReadOnly } from "@/lib/storage";

const ATTEMPTS_PER_WINDOW = 10;
const WINDOW_MS = 15 * 60 * 1000;

function fail(status: number, code: AuthErrorCode, field?: AuthField, headers?: HeadersInit) {
  return NextResponse.json({ error: AUTH_MESSAGES[code], code, field }, { status, headers });
}

/**
 * POST /api/auth/login  { email, password }
 *   200 { id, name, email }   signed in
 *   400 missing field         401 invalid_credentials (same message whether the email exists or not)
 *   429 too_many_attempts     500 server_error
 */
export async function POST(request: Request) {
  const limit = rateLimit(`login:${clientIp(request)}`, ATTEMPTS_PER_WINDOW, WINDOW_MS);
  if (!limit.ok) return fail(429, "too_many_attempts", undefined, { "Retry-After": String(limit.retryAfterSec) });

  // Hosted without a connected database nothing can be saved; say so instead of a vague 500.
  if (storeIsReadOnly) return fail(503, "store_unavailable");

  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail(400, "invalid_body");
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email) return fail(400, "email_required", "email");
  if (!password) return fail(400, "password_required", "password");

  try {
    const user = await findUserByEmail(email);
    // Verify against a dummy hash when the user is unknown so timing does not reveal which emails exist.
    const ok = user
      ? await verifyPassword(password, user.passwordHash)
      : await verifyPassword(password, "$2b$10$CwTycUXWue0Thq9StjUM0uJ8ZQ0ZBw6q6gK5m1vBQ0jYm9QkX3M0K").then(() => false);
    if (!user || !ok) return fail(401, "invalid_credentials");

    const token = await createSession(CUSTOMER_SESSION_FILE, user.id);
    const cookieStore = await cookies();
    cookieStore.set(CUSTOMER_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error("[login] failed:", err);
    return fail(500, "server_error");
  }
}

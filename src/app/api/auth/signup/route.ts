import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createUser, findUserByEmail, findUserById, DuplicateEmailError } from "@/lib/users";
import { hashPassword } from "@/lib/password";
import { createSession, getSubjectId } from "@/lib/session-store";
import { CUSTOMER_SESSION_FILE, CUSTOMER_COOKIE, SESSION_MAX_AGE } from "@/lib/auth-constants";
import { AUTH_MESSAGES, validateSignup, type AuthErrorCode, type AuthField } from "@/lib/auth-validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { storeIsReadOnly } from "@/lib/storage";

const SIGNUPS_PER_WINDOW = 5;
const WINDOW_MS = 15 * 60 * 1000;

function fail(status: number, code: AuthErrorCode, field?: AuthField, headers?: HeadersInit) {
  return NextResponse.json({ error: AUTH_MESSAGES[code], code, field }, { status, headers });
}

/**
 * POST /api/auth/signup  { name, email, password, confirmPassword? }
 *   201 { id, name, email }          account created and signed in
 *   400 { error, code, field }       validation failed (see auth-validation.ts)
 *   409 email_exists / already_signed_in
 *   429 too_many_attempts
 *   500 server_error                 nothing about the failure is exposed to the client
 */
export async function POST(request: Request) {
  const limit = rateLimit(`signup:${clientIp(request)}`, SIGNUPS_PER_WINDOW, WINDOW_MS);
  if (!limit.ok) return fail(429, "too_many_attempts", undefined, { "Retry-After": String(limit.retryAfterSec) });

  // Hosted without a connected database nothing can be saved; say so instead of a vague 500.
  if (storeIsReadOnly) return fail(503, "store_unavailable");

  // Someone already signed in should log out before creating another account.
  const cookieStore = await cookies();
  const currentId = await getSubjectId(CUSTOMER_SESSION_FILE, cookieStore.get(CUSTOMER_COOKIE)?.value);
  if (currentId && (await findUserById(currentId).catch(() => undefined))) {
    return fail(409, "already_signed_in");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "invalid_body");
  }
  if (!body || typeof body !== "object") return fail(400, "invalid_body");

  const checked = validateSignup(body as Record<string, unknown>);
  if (!checked.ok) return fail(400, checked.code, checked.field);

  try {
    // Early, friendly duplicate check; createUser repeats it under a lock so a race cannot slip through.
    if (await findUserByEmail(checked.email)) return fail(409, "email_exists", "email");

    const user = await createUser({
      name: checked.name,
      email: checked.email,
      passwordHash: await hashPassword(checked.password),
    });

    const token = await createSession(CUSTOMER_SESSION_FILE, user.id);
    cookieStore.set(CUSTOMER_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
  } catch (err) {
    if (err instanceof DuplicateEmailError) return fail(409, "email_exists", "email");
    console.error("[signup] account creation failed:", err);
    return fail(500, "server_error");
  }
}

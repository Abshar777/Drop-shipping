import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSubjectId } from "@/lib/session-store";
import { findUserById } from "@/lib/users";
import { getAdminSession } from "@/lib/require-admin";
import { CUSTOMER_SESSION_FILE, CUSTOMER_COOKIE } from "@/lib/auth-constants";

/**
 * GET /api/auth/me -> { user, admin }
 * `user` is the signed-in customer (or null); `admin` is set only when a valid admin
 * session cookie is present, so the storefront can show the dashboard link to admins alone.
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE)?.value;
  const userId = await getSubjectId(CUSTOMER_SESSION_FILE, token);
  const user = userId ? await findUserById(userId) : undefined;

  const adminSession = await getAdminSession();

  return NextResponse.json({
    user: user ? { id: user.id, name: user.name, email: user.email } : null,
    admin: adminSession ? { id: adminSession.id, name: adminSession.name } : null,
  });
}

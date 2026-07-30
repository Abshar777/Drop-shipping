import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSubjectId } from "@/lib/session-store";
import { findUserById } from "@/lib/users";
import { CUSTOMER_SESSION_FILE, CUSTOMER_COOKIE } from "@/lib/auth-constants";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE)?.value;
  const userId = await getSubjectId(CUSTOMER_SESSION_FILE, token);
  if (!userId) return NextResponse.json({ user: null });

  const user = await findUserById(userId);
  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
}

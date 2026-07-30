import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSubjectId } from "./session-store";
import { findAdminById } from "./admins";
import { ADMIN_SESSION_FILE, ADMIN_COOKIE } from "./auth-constants";

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const adminId = await getSubjectId(ADMIN_SESSION_FILE, token);
  if (!adminId) return null;
  return (await findAdminById(adminId)) ?? null;
}

export async function requireAdmin() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const adminId = await getSubjectId(ADMIN_SESSION_FILE, token);
  return !!adminId;
}

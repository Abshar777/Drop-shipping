import { readJson, writeJson } from "./storage";
import type { Admin } from "./types";

const ADMINS_FILE = "admins.json";

export async function getAdmins(): Promise<Admin[]> {
  try {
    return await readJson<Admin[]>(ADMINS_FILE, []);
  } catch {
    return [];
  }
}

export async function saveAdmins(admins: Admin[]): Promise<void> {
  await writeJson(ADMINS_FILE, admins);
}

export async function findAdminByEmail(email: string): Promise<Admin | undefined> {
  const admins = await getAdmins();
  return admins.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
}

export async function findAdminById(id: string): Promise<Admin | undefined> {
  const admins = await getAdmins();
  return admins.find((a) => a.id === id);
}

/**
 * First-admin bootstrap for a fresh deployment. When ADMIN_EMAIL and ADMIN_PASSWORD are set
 * in the environment and no admin with that email exists yet, create it. Runs on admin login,
 * so setting the variables and redeploying is enough to get into a new site's dashboard.
 */
export async function ensureBootstrapAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) return;
  const admins = await getAdmins();
  if (admins.some((a) => a.email.toLowerCase() === email)) return;
  const { hashPassword } = await import("./password");
  admins.push({
    id: `admin${Date.now()}`,
    name: process.env.ADMIN_NAME?.trim() || "Store Admin",
    email,
    passwordHash: await hashPassword(password),
  });
  await saveAdmins(admins);
}

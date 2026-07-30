import fs from "fs/promises";
import path from "path";
import type { Admin } from "./types";

const ADMINS_PATH = path.join(process.cwd(), "data", "admins.json");

export async function getAdmins(): Promise<Admin[]> {
  try {
    const raw = await fs.readFile(ADMINS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function findAdminByEmail(email: string): Promise<Admin | undefined> {
  const admins = await getAdmins();
  return admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
}

export async function findAdminById(id: string): Promise<Admin | undefined> {
  const admins = await getAdmins();
  return admins.find((a) => a.id === id);
}

import fs from "fs/promises";
import path from "path";
import type { User } from "./types";

const USERS_PATH = path.join(process.cwd(), "data", "users.json");

export async function getUsers(): Promise<User[]> {
  try {
    const raw = await fs.readFile(USERS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveUsers(users: User[]): Promise<void> {
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), "utf-8");
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function findUserById(id: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((u) => u.id === id);
}

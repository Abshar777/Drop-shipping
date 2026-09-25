import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import type { User } from "./types";

const USERS_PATH = path.join(process.cwd(), "data", "users.json");

/**
 * Canonical form of an email for storage and comparison: trimmed and lower-cased.
 * "MilesCapitals@Gmail.com " and "milescapitals@gmail.com" are the same account.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Read all users. A missing file means "no users yet"; a corrupt file throws so we
 * never overwrite real accounts with a fresh list by mistake.
 */
export async function getUsers(): Promise<User[]> {
  let raw: string;
  try {
    raw = await fs.readFile(USERS_PATH, "utf-8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  if (!raw.trim()) return [];
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("users.json is not a list");
  return parsed;
}

export async function saveUsers(users: User[]): Promise<void> {
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2) + "\n", "utf-8");
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const key = normalizeEmail(email);
  const users = await getUsers();
  return users.find((u) => normalizeEmail(u.email) === key);
}

export async function findUserById(id: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((u) => u.id === id);
}

// Serialises read-modify-write on users.json within this process, so two sign-ups that
// arrive at the same moment cannot both pass the duplicate check and both be saved.
let queue: Promise<unknown> = Promise.resolve();
function withUsersLock<T>(work: () => Promise<T>): Promise<T> {
  const run = queue.then(work, work);
  queue = run.catch(() => undefined);
  return run;
}

export class DuplicateEmailError extends Error {
  constructor() {
    super("An account with this email already exists");
    this.name = "DuplicateEmailError";
  }
}

/** Create a user, enforcing the unique-email rule at the store level. */
export async function createUser(input: { name: string; email: string; passwordHash: string }): Promise<User> {
  return withUsersLock(async () => {
    const users = await getUsers();
    const email = normalizeEmail(input.email);
    if (users.some((u) => normalizeEmail(u.email) === email)) throw new DuplicateEmailError();

    const user: User = {
      id: `u${Date.now()}${crypto.randomBytes(3).toString("hex")}`,
      name: input.name.trim(),
      email,
      passwordHash: input.passwordHash,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    await saveUsers(users);
    return user;
  });
}

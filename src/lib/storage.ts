// Where the store's data lives.
//
// Locally: the JSON files under data/ (readable, writable, committed as seed data).
// On a host with a read-only disk (Vercel): a hosted Redis database via its REST API,
// enabled by setting UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN. Each data file
// becomes one key. The first read of a key that does not exist yet is seeded from the
// bundled JSON file, so a fresh database starts with the products and categories from git.
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

/** True when writes go to the hosted database instead of the local files. */
export const usingRemoteStore = Boolean(REST_URL && REST_TOKEN);

/** True when running on Vercel without a database, i.e. nothing can be saved. */
export const storeIsReadOnly = Boolean(process.env.VERCEL) && !usingRemoteStore;

async function redis<T = unknown>(command: Array<string | number>): Promise<T> {
  const res = await fetch(REST_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${REST_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Data store request failed with status ${res.status}`);
  const data = (await res.json()) as { result?: T; error?: string };
  if (data.error) throw new Error(`Data store error: ${data.error}`);
  return data.result as T;
}

/** Local file, or undefined when it does not exist. Corrupt JSON throws. */
async function readLocal<T>(file: string): Promise<T | undefined> {
  let raw: string;
  try {
    raw = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw err;
  }
  if (!raw.trim()) return undefined;
  return JSON.parse(raw) as T;
}

export async function readJson<T>(file: string, fallback: T): Promise<T> {
  if (usingRemoteStore) {
    const stored = await redis<string | null>(["GET", `data:${file}`]);
    if (stored !== null && stored !== undefined) return JSON.parse(stored) as T;
  }
  const local = await readLocal<T>(file);
  return local === undefined ? fallback : local;
}

export async function writeJson(file: string, data: unknown): Promise<void> {
  const text = JSON.stringify(data, null, 2) + "\n";
  if (usingRemoteStore) {
    await redis(["SET", `data:${file}`, text]);
    return;
  }
  await fs.writeFile(path.join(DATA_DIR, file), text, "utf-8");
}

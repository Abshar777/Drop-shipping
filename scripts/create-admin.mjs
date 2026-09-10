#!/usr/bin/env node
/**
 * Create or reset an admin login for the store.
 *
 * Interactive:   node scripts/create-admin.mjs
 * Non-interactive (CI/seeding):
 *   ADMIN_NAME="Store Admin" ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret node scripts/create-admin.mjs
 *
 * If the email already exists, that admin's name and password are updated.
 * Admins are stored in data/admins.json with a bcrypt hash (cost 10), matching src/lib/password.ts.
 */
import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";
import bcrypt from "bcryptjs";

const ADMINS_PATH = path.join(process.cwd(), "data", "admins.json");
const MIN_PASSWORD_LENGTH = 8;

const CTRL_C = String.fromCharCode(3);
const DEL = String.fromCharCode(127);

function askVisible(label) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(label, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function askHidden(label) {
  const stdin = process.stdin;
  if (!stdin.isTTY) return askVisible(label);
  return new Promise((resolve) => {
    process.stdout.write(label);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener("data", onData);
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (ch === CTRL_C) {
          process.stdout.write("\n");
          process.exit(130);
        }
        if (ch === DEL || ch === "\b") {
          value = value.slice(0, -1);
          continue;
        }
        value += ch;
      }
    };
    stdin.on("data", onData);
  });
}

async function readAdmins() {
  try {
    return JSON.parse(await fs.readFile(ADMINS_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

async function collectInput() {
  const fromEnv = process.env.ADMIN_NAME && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD;
  if (fromEnv) {
    return {
      name: process.env.ADMIN_NAME.trim(),
      email: process.env.ADMIN_EMAIL.trim(),
      password: process.env.ADMIN_PASSWORD,
    };
  }

  console.log("Create or reset a store admin login\n");
  const name = await askVisible("Admin name: ");
  const email = await askVisible("Admin email: ");
  const password = await askHidden(`Password (min ${MIN_PASSWORD_LENGTH} chars, typing is hidden): `);
  const confirm = await askHidden("Confirm password: ");
  if (password !== confirm) fail("passwords do not match");
  return { name, email, password };
}

const { name, email, password } = await collectInput();

if (!name) fail("name is required");
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("email does not look valid");
if (password.length < MIN_PASSWORD_LENGTH) fail(`password must be at least ${MIN_PASSWORD_LENGTH} characters`);

const admins = await readAdmins();
const passwordHash = await bcrypt.hash(password, 10);
const existing = admins.find((a) => a.email.toLowerCase() === email.toLowerCase());

if (existing) {
  existing.name = name;
  existing.passwordHash = passwordHash;
} else {
  admins.push({ id: `admin${Date.now()}`, name, email, passwordHash });
}

await fs.mkdir(path.dirname(ADMINS_PATH), { recursive: true });
await fs.writeFile(ADMINS_PATH, JSON.stringify(admins, null, 2) + "\n", "utf-8");

console.log(
  existing
    ? `Updated admin "${email}". Password reset.`
    : `Created admin "${email}". Log in at /admin/login.`
);

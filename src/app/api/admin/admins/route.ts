import { NextResponse } from "next/server";
import { getAdmins, saveAdmins, findAdminByEmail } from "@/lib/admins";
import { getUsers, findUserById } from "@/lib/users";
import { hashPassword } from "@/lib/password";
import { isAdminAuthenticated } from "@/lib/require-admin";
import type { Admin } from "@/lib/types";

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicAdmin = (a: Admin) => ({ id: a.id, name: a.name, email: a.email });

/**
 * GET /api/admin/admins -> { admins, users }   (admin only)
 * `users` are customer accounts, flagged when an admin with the same email already exists,
 * so the dashboard can offer the rest for promotion.
 */
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [admins, users] = await Promise.all([getAdmins(), getUsers()]);
  const adminEmails = new Set(admins.map((a) => a.email.toLowerCase()));
  return NextResponse.json({
    admins: admins.map(publicAdmin),
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      isAdmin: adminEmails.has(u.email.toLowerCase()),
    })),
  });
}

/**
 * POST /api/admin/admins   (admin only)
 *   { userId }                  -> promote an existing customer; they keep their password
 *   { name, email, password }   -> create a brand-new admin login
 */
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const admins = await getAdmins();

  let candidate: Omit<Admin, "id"> | null = null;

  if (typeof body.userId === "string" && body.userId) {
    const user = await findUserById(body.userId);
    if (!user) return NextResponse.json({ error: "Customer account not found" }, { status: 404 });
    candidate = { name: user.name, email: user.email, passwordHash: user.passwordHash };
  } else {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Email does not look valid" }, { status: 400 });
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }, { status: 400 });
    }
    candidate = { name, email, passwordHash: await hashPassword(password) };
  }

  if (await findAdminByEmail(candidate.email)) {
    return NextResponse.json({ error: "An admin with this email already exists" }, { status: 409 });
  }

  const admin: Admin = { id: `admin${Date.now()}`, ...candidate };
  admins.push(admin);
  await saveAdmins(admins);
  return NextResponse.json(publicAdmin(admin), { status: 201 });
}

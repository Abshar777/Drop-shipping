import { NextResponse } from "next/server";
import { getThemeSettings, saveThemeSettings, sanitizeThemeSettings } from "@/lib/theme-store";
import { isAdminAuthenticated } from "@/lib/require-admin";

/** GET /api/theme -> { settings }  (admin only) */
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ settings: await getThemeSettings() });
}

/** PUT /api/theme  { preset, overrides? } -> { settings }  (admin only) */
export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const settings = sanitizeThemeSettings(body);
  await saveThemeSettings(settings);
  return NextResponse.json({ settings });
}

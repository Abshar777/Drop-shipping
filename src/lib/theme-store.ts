import fs from "fs/promises";
import path from "path";
import {
  DEFAULT_THEME_SETTINGS,
  THEME_COLOR_KEYS,
  THEME_PRESETS,
  getPreset,
  hasCustomizations,
  isHexColor,
  isThemeCorners,
  isThemeFont,
  type ThemeOverrides,
  type ThemeSettings,
} from "./themes";

const THEME_PATH = path.join(process.cwd(), "data", "theme.json");

function sanitizeOverrides(input: unknown): ThemeOverrides {
  const raw = (input ?? {}) as Partial<ThemeOverrides>;
  const overrides: ThemeOverrides = {};

  if (raw.colors && typeof raw.colors === "object") {
    const clean: Record<string, string> = {};
    for (const key of THEME_COLOR_KEYS) {
      const value = (raw.colors as Record<string, unknown>)[key];
      if (isHexColor(value)) clean[key] = value.toLowerCase();
    }
    if (Object.keys(clean).length) overrides.colors = clean;
  }
  if (isThemeFont(raw.font)) overrides.font = raw.font;
  if (isThemeCorners(raw.corners)) overrides.corners = raw.corners;
  return overrides;
}

/**
 * Drop anything that is not a known preset, colour key, font, or corner style.
 * Also accepts the earlier shape { preset, overrides } and folds it into customizations.
 */
export function sanitizeThemeSettings(input: unknown): ThemeSettings {
  const raw = (input ?? {}) as Partial<ThemeSettings> & { overrides?: unknown };
  const preset = typeof raw.preset === "string" ? getPreset(raw.preset).id : DEFAULT_THEME_SETTINGS.preset;

  const customizations: Record<string, ThemeOverrides> = {};
  const source = raw.customizations && typeof raw.customizations === "object" ? raw.customizations : {};
  for (const p of THEME_PRESETS) {
    const overrides = sanitizeOverrides((source as Record<string, unknown>)[p.id]);
    if (hasCustomizations(overrides)) customizations[p.id] = overrides;
  }
  if (raw.overrides && !customizations[preset]) {
    const legacy = sanitizeOverrides(raw.overrides);
    if (hasCustomizations(legacy)) customizations[preset] = legacy;
  }

  return { preset, customizations };
}

export async function getThemeSettings(): Promise<ThemeSettings> {
  try {
    const raw = await fs.readFile(THEME_PATH, "utf-8");
    return sanitizeThemeSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_THEME_SETTINGS;
  }
}

export async function saveThemeSettings(settings: ThemeSettings): Promise<void> {
  await fs.writeFile(THEME_PATH, JSON.stringify(settings, null, 2) + "\n", "utf-8");
}

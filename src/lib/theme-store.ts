import { readJson, writeJson } from "./storage";
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

const THEME_FILE = "theme.json";

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
    return sanitizeThemeSettings(await readJson<unknown>(THEME_FILE, DEFAULT_THEME_SETTINGS));
  } catch {
    return DEFAULT_THEME_SETTINGS;
  }
}

export async function saveThemeSettings(settings: ThemeSettings): Promise<void> {
  await writeJson(THEME_FILE, settings);
}

// Storefront theme presets and the settings model the admin edits.
// Pure module (no fs): safe to import from server and client code.

export const THEME_FONTS = {
  assistant: { label: "Assistant", family: "Assistant" },
  inter: { label: "Inter", family: "Inter" },
  poppins: { label: "Poppins", family: "Poppins" },
  "dm-sans": { label: "DM Sans", family: "DM Sans" },
} as const;
export type ThemeFont = keyof typeof THEME_FONTS;

export const THEME_CORNERS = {
  sharp: { label: "Sharp", card: "0px", button: "0px", input: "0px" },
  soft: { label: "Soft", card: "0.5rem", button: "0.375rem", input: "0.375rem" },
  round: { label: "Round", card: "1rem", button: "0.75rem", input: "0.5rem" },
  pill: { label: "Pill", card: "1.25rem", button: "9999px", input: "0.75rem" },
} as const;
export type ThemeCorners = keyof typeof THEME_CORNERS;

export type ThemeColors = {
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  border: string;
  primary: string;
  primaryHover: string;
  primaryForeground: string;
  primarySoft: string;
  accent: string;
  accentForeground: string;
  accentSoft: string;
  heroFrom: string;
  heroTo: string;
  heroForeground: string;
  heroButton: string;
  heroButtonForeground: string;
  footer: string;
  footerForeground: string;
};

export const THEME_COLOR_LABELS: Record<keyof ThemeColors, string> = {
  background: "Page background",
  surface: "Cards & inputs",
  foreground: "Text",
  muted: "Secondary text",
  border: "Borders",
  primary: "Buttons & links",
  primaryHover: "Button hover",
  primaryForeground: "Button text",
  primarySoft: "Tinted backgrounds",
  accent: "Badges & highlights",
  accentForeground: "Badge text",
  accentSoft: "Icon accent",
  heroFrom: "Hero gradient start",
  heroTo: "Hero gradient end",
  heroForeground: "Hero text",
  heroButton: "Hero button",
  heroButtonForeground: "Hero button text",
  footer: "Footer background",
  footerForeground: "Footer text",
};
export const THEME_COLOR_KEYS = Object.keys(THEME_COLOR_LABELS) as Array<keyof ThemeColors>;

export type ThemePreset = {
  id: string;
  name: string;
  tagline: string;
  dark: boolean;
  font: ThemeFont;
  corners: ThemeCorners;
  colors: ThemeColors;
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "sense",
    name: "Sense",
    tagline: "Fresh and bright: pastel gradients, pill buttons, rounded cards.",
    dark: false,
    font: "assistant",
    corners: "pill",
    colors: {
      background: "#ffffff",
      surface: "#f8f7fc",
      foreground: "#1a1a2e",
      muted: "#6b6b80",
      border: "#e6e4f0",
      primary: "#5a48f5",
      primaryHover: "#4636d6",
      primaryForeground: "#ffffff",
      primarySoft: "#eeebff",
      accent: "#ff6b9a",
      accentForeground: "#ffffff",
      accentSoft: "#ffd6e5",
      heroFrom: "#e7deff",
      heroTo: "#ffe1d6",
      heroForeground: "#1a1a2e",
      heroButton: "#1a1a2e",
      heroButtonForeground: "#ffffff",
      footer: "#1a1a2e",
      footerForeground: "#d6d3e8",
    },
  },
  {
    id: "dawn",
    name: "Dawn",
    tagline: "Minimal black and white with sharp corners. Lets products lead.",
    dark: false,
    font: "assistant",
    corners: "sharp",
    colors: {
      background: "#ffffff",
      surface: "#f3f3f3",
      foreground: "#121212",
      muted: "#707070",
      border: "#e5e5e5",
      primary: "#121212",
      primaryHover: "#2b2b2b",
      primaryForeground: "#ffffff",
      primarySoft: "#ededed",
      accent: "#121212",
      accentForeground: "#ffffff",
      accentSoft: "#dedede",
      heroFrom: "#f3f3f3",
      heroTo: "#e9e9e9",
      heroForeground: "#121212",
      heroButton: "#121212",
      heroButtonForeground: "#ffffff",
      footer: "#f3f3f3",
      footerForeground: "#121212",
    },
  },
  {
    id: "craft",
    name: "Craft",
    tagline: "Warm, earthy tones for handmade and artisan goods.",
    dark: false,
    font: "dm-sans",
    corners: "soft",
    colors: {
      background: "#fbf7f1",
      surface: "#ffffff",
      foreground: "#2c241b",
      muted: "#7a6a58",
      border: "#e8dfd3",
      primary: "#7a5230",
      primaryHover: "#5f3f24",
      primaryForeground: "#ffffff",
      primarySoft: "#f3e8dc",
      accent: "#c89b62",
      accentForeground: "#2c241b",
      accentSoft: "#f0dfc4",
      heroFrom: "#eadbc8",
      heroTo: "#f8efe3",
      heroForeground: "#2c241b",
      heroButton: "#7a5230",
      heroButtonForeground: "#ffffff",
      footer: "#2c241b",
      footerForeground: "#e8dfd3",
    },
  },
  {
    id: "refresh",
    name: "Refresh",
    tagline: "Clean greens and rounded shapes for health, food, and wellness.",
    dark: false,
    font: "poppins",
    corners: "round",
    colors: {
      background: "#ffffff",
      surface: "#f0faf6",
      foreground: "#0f2a22",
      muted: "#4f6b62",
      border: "#d6ebe2",
      primary: "#0e9f6e",
      primaryHover: "#0b7f58",
      primaryForeground: "#ffffff",
      primarySoft: "#ddf5ec",
      accent: "#f59e0b",
      accentForeground: "#1a1a1a",
      accentSoft: "#fde7b8",
      heroFrom: "#cdefe1",
      heroTo: "#e9fbf3",
      heroForeground: "#0f2a22",
      heroButton: "#0e9f6e",
      heroButtonForeground: "#ffffff",
      footer: "#0f2a22",
      footerForeground: "#cdefe1",
    },
  },
  {
    id: "studio",
    name: "Studio",
    tagline: "Dark mode with a gold accent for premium and tech brands.",
    dark: true,
    font: "inter",
    corners: "soft",
    colors: {
      background: "#0e0e12",
      surface: "#17171e",
      foreground: "#f4f4f6",
      muted: "#a0a0ae",
      border: "#2a2a35",
      primary: "#f4f4f6",
      primaryHover: "#dddde4",
      primaryForeground: "#0e0e12",
      primarySoft: "#23232d",
      accent: "#ffb020",
      accentForeground: "#0e0e12",
      accentSoft: "#4a3a12",
      heroFrom: "#2a1e5c",
      heroTo: "#0e0e12",
      heroForeground: "#f4f4f6",
      heroButton: "#ffb020",
      heroButtonForeground: "#0e0e12",
      footer: "#08080b",
      footerForeground: "#a0a0ae",
    },
  },
  {
    id: "classic",
    name: "Classic Orange",
    tagline: "The original anyitems look: bold orange on white.",
    dark: false,
    font: "inter",
    corners: "soft",
    colors: {
      background: "#ffffff",
      surface: "#f9fafb",
      foreground: "#111827",
      muted: "#6b7280",
      border: "#e5e7eb",
      primary: "#ea580c",
      primaryHover: "#c2410c",
      primaryForeground: "#ffffff",
      primarySoft: "#fff7ed",
      accent: "#ea580c",
      accentForeground: "#ffffff",
      accentSoft: "#fdba74",
      heroFrom: "#ea580c",
      heroTo: "#f59e0b",
      heroForeground: "#ffffff",
      heroButton: "#ffffff",
      heroButtonForeground: "#c2410c",
      footer: "#111827",
      footerForeground: "#d1d5db",
    },
  },
];

export const DEFAULT_THEME_ID = "sense";

export function getPreset(id: string): ThemePreset {
  return THEME_PRESETS.find((p) => p.id === id) ?? THEME_PRESETS[0];
}

/** Tweaks layered on top of one preset. */
export type ThemeOverrides = {
  colors?: Partial<ThemeColors>;
  font?: ThemeFont;
  corners?: ThemeCorners;
};

/**
 * What the admin saves: which preset is live, plus each preset's own customisations.
 * Customisations are kept per preset so switching themes never loses work.
 */
export type ThemeSettings = {
  preset: string;
  customizations: Record<string, ThemeOverrides>;
};

export const DEFAULT_THEME_SETTINGS: ThemeSettings = { preset: DEFAULT_THEME_ID, customizations: {} };

export function hasCustomizations(overrides: ThemeOverrides | undefined): boolean {
  if (!overrides) return false;
  return Boolean(overrides.font) || Boolean(overrides.corners) || Boolean(overrides.colors && Object.keys(overrides.colors).length);
}

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

export function isThemeFont(value: unknown): value is ThemeFont {
  return typeof value === "string" && value in THEME_FONTS;
}

export function isThemeCorners(value: unknown): value is ThemeCorners {
  return typeof value === "string" && value in THEME_CORNERS;
}

/** Any preset with its saved customisations applied (used for previews and the live theme alike). */
export function resolvePreset(settings: ThemeSettings, presetId: string): ThemePreset {
  const base = getPreset(presetId);
  const overrides = settings.customizations?.[base.id] ?? {};
  const colors: ThemeColors = { ...base.colors };
  for (const key of THEME_COLOR_KEYS) {
    const value = overrides.colors?.[key];
    if (isHexColor(value)) colors[key] = value;
  }
  return {
    ...base,
    font: isThemeFont(overrides.font) ? overrides.font : base.font,
    corners: isThemeCorners(overrides.corners) ? overrides.corners : base.corners,
    colors,
  };
}

/** The theme the storefront should render right now. */
export function resolveTheme(settings: ThemeSettings): ThemePreset {
  return resolvePreset(settings, settings.preset);
}

/** Normalise "#abc" / "abc123" / "#ABC123" to "#abc123"; null when it is not a colour. */
export function normalizeHex(value: string): string | null {
  const v = value.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{6}$/.test(v)) return `#${v}`;
  if (/^[0-9a-f]{3}$/.test(v)) return `#${v[0]}${v[0]}${v[1]}${v[1]}${v[2]}${v[2]}`;
  return null;
}

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());

/** CSS custom properties the root layout puts on <html>; globals.css maps them to Tailwind tokens. */
export function themeCssVars(theme: ThemePreset): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const key of THEME_COLOR_KEYS) vars[`--theme-${kebab(key)}`] = theme.colors[key];
  vars["--theme-hero"] = `linear-gradient(135deg, ${theme.colors.heroFrom}, ${theme.colors.heroTo})`;
  const corners = THEME_CORNERS[theme.corners];
  vars["--theme-radius-card"] = corners.card;
  vars["--theme-radius-button"] = corners.button;
  vars["--theme-radius-input"] = corners.input;
  vars["--theme-font"] = `"${THEME_FONTS[theme.font].family}"`;
  return vars;
}

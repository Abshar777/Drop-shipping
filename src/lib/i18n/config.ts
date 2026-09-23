// Supported storefront languages. Add a locale here and a matching dictionary file.
export const LOCALES = [
  { code: "en", label: "English", native: "English", dir: "ltr" },
  { code: "hi", label: "Hindi", native: "हिन्दी", dir: "ltr" },
  { code: "ar", label: "Arabic", native: "العربية", dir: "rtl" },
  { code: "ml", label: "Malayalam", native: "മലയാളം", dir: "ltr" },
  { code: "ta", label: "Tamil", native: "தமிழ்", dir: "ltr" },
  { code: "ur", label: "Urdu", native: "اردو", dir: "rtl" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];
export type TextDirection = "ltr" | "rtl";

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie that remembers the visitor's choice. Readable by client JS on purpose (not httpOnly). */
export const LOCALE_COOKIE = "anyitems_lang";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && LOCALES.some((l) => l.code === value);
}

export function localeDir(locale: Locale): TextDirection {
  return LOCALES.find((l) => l.code === locale)?.dir ?? "ltr";
}

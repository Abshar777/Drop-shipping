// Shared, runtime-agnostic pieces of the language system. Safe on server and client.
import en, { type Dictionary } from "./dictionaries/en";
import hi from "./dictionaries/hi";
import ar from "./dictionaries/ar";
import ml from "./dictionaries/ml";
import ta from "./dictionaries/ta";
import ur from "./dictionaries/ur";
import type { Locale } from "./config";

export type { Dictionary };
export * from "./config";

const DICTIONARIES: Record<Locale, Dictionary> = { en, hi, ar, ml, ta, ur };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? en;
}

/** Fill {placeholders} in a translated string: fmt("Hi, {name}", { name: "Asha" }). */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match
  );
}

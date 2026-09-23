// Server-only helpers: read the visitor's language from the cookie (or browser preference).
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, localeDir, type Locale } from "./config";
import { getDictionary } from "./index";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const chosen = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(chosen)) return chosen;

  // First visit: honour the browser's preferred language if we support it.
  const accept = (await headers()).get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const code = part.trim().split(";")[0].toLowerCase().split("-")[0];
    if (isLocale(code)) return code;
  }
  return DEFAULT_LOCALE;
}

/** Everything a server component needs: the locale, its dictionary, and text direction. */
export async function getT() {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale), dir: localeDir(locale) };
}

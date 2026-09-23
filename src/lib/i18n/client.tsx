"use client";

// Client-side access to the current language. The root layout seeds the provider from the server.
import { createContext, useContext, type ReactNode } from "react";
import type { Locale, TextDirection } from "./config";
import type { Dictionary } from "./dictionaries/en";

type I18nContextValue = { locale: Locale; t: Dictionary; dir: TextDirection };

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function LocaleProvider({
  locale,
  dictionary,
  dir,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  dir: TextDirection;
  children: ReactNode;
}) {
  return <I18nContext.Provider value={{ locale, t: dictionary, dir }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LocaleProvider");
  return ctx;
}

export function useT(): Dictionary {
  return useI18n().t;
}

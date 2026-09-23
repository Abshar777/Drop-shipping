"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, isLocale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(next: string) {
    if (!isLocale(next) || next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
    // Re-render server components with the new cookie; the URL stays the same.
    startTransition(() => router.refresh());
  }

  return (
    <label className={`flex items-center gap-1 text-sm text-muted ${className}`} title={t.common.language}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-5 h-5 shrink-0"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
      </svg>
      <span className="sr-only">{t.common.language}</span>
      <select
        value={locale}
        onChange={(e) => change(e.target.value)}
        disabled={pending}
        aria-label={t.common.language}
        className="bg-surface border border-border rounded-btn px-2 py-1 text-sm text-foreground hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 cursor-pointer"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code} lang={l.code}>
            {l.native}
          </option>
        ))}
      </select>
    </label>
  );
}

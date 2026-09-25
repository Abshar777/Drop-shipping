"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/lib/i18n/client";
import { fmt } from "@/lib/i18n";

/** Shown on /login and /signup when a customer is already signed in. */
export default function AlreadySignedIn({ name }: { name: string }) {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-foreground mb-2">{fmt(t.auth.alreadySignedIn, { name })}</h1>
      <p className="text-sm text-muted mb-6">{t.auth.logoutToSwitch}</p>
      <div className="flex flex-col gap-3">
        <Link href="/" className="bg-primary text-primary-foreground font-semibold py-2.5 rounded-btn hover:bg-primary-hover">
          {t.auth.goToStore}
        </Link>
        <button
          onClick={logout}
          disabled={busy}
          className="border border-border text-foreground font-medium py-2.5 rounded-btn hover:bg-surface disabled:opacity-50"
        >
          {t.common.logout}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/client";

const inputClass =
  "border border-border bg-surface text-foreground placeholder:text-muted rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

export default function SignupPage() {
  const router = useRouter();
  const t = useT();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || t.auth.genericError);
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-foreground mb-6 text-center">{t.auth.signupTitle}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-input px-3 py-2">{error}</p>}
        <input
          required
          placeholder={t.auth.fullName}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClass}
        />
        <input
          required
          type="email"
          placeholder={t.auth.email}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={inputClass}
        />
        <input
          required
          type="password"
          placeholder={t.auth.passwordHint}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-primary text-primary-foreground font-semibold py-2.5 rounded-btn hover:bg-primary-hover disabled:opacity-50"
        >
          {submitting ? t.auth.creating : t.common.signup}
        </button>
      </form>
      <p className="text-sm text-muted text-center mt-4">
        {t.auth.haveAccount}{" "}
        <Link href="/login" className="text-primary hover:underline">
          {t.auth.loginLink}
        </Link>
      </p>
    </div>
  );
}

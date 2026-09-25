"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/client";
import { validateSignup, type AuthErrorCode, type AuthField } from "@/lib/auth-validation";

const inputBase =
  "border bg-surface text-foreground placeholder:text-muted rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

type FormState = { name: string; email: string; password: string; confirmPassword: string };
type FieldErrors = Partial<Record<AuthField, string>>;

export default function SignupForm() {
  const router = useRouter();
  const t = useT();
  const [form, setForm] = useState<FormState>({ name: "", email: "", password: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<{ text: string; code?: AuthErrorCode } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Server codes map to translated messages; unknown codes fall back to the server's text.
  function message(code: AuthErrorCode | undefined, fallback?: string) {
    return (code && t.auth.errors[code]) || fallback || t.auth.genericError;
  }

  function update(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((e) => ({ ...e, [field]: undefined }));
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Same rules as the server, checked here first for instant feedback.
    const checked = validateSignup(form);
    if (!checked.ok) {
      setFieldErrors({ [checked.field]: message(checked.code) });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, email: form.email.trim() }),
      });

      let data: { error?: string; code?: AuthErrorCode; field?: AuthField } = {};
      try {
        data = await res.json();
      } catch {
        // Non-JSON response (proxy error page, crash): treated as a server error below.
      }

      if (res.ok) {
        router.push("/?welcome=1");
        router.refresh();
        return;
      }

      const text = message(data.code, res.status >= 500 ? undefined : data.error);
      // A duplicate email goes in the banner so the "sign in instead" link can sit next to it.
      if (data.field && data.code !== "email_exists") setFieldErrors({ [data.field]: text });
      else setError({ text, code: data.code });
    } catch {
      setError({ text: t.auth.errors.network });
    } finally {
      setSubmitting(false);
    }
  }

  const field = (name: keyof FormState, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="flex flex-col gap-1">
      <input
        {...props}
        value={form[name]}
        onChange={(e) => update(name, e.target.value)}
        aria-invalid={Boolean(fieldErrors[name])}
        className={`${inputBase} ${fieldErrors[name] ? "border-red-500" : "border-border"}`}
      />
      {fieldErrors[name] && <p className="text-xs text-red-600">{fieldErrors[name]}</p>}
    </div>
  );

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-foreground mb-6 text-center">{t.auth.signupTitle}</h1>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-input px-3 py-2">
            {error.text}
            {error.code === "email_exists" && (
              <>
                {" "}
                <Link href="/login" className="underline font-medium">
                  {t.auth.loginLink}
                </Link>
              </>
            )}
          </p>
        )}
        {field("name", { placeholder: t.auth.fullName, autoComplete: "name" })}
        {field("email", { type: "email", placeholder: t.auth.email, autoComplete: "email", inputMode: "email" })}
        {field("password", { type: "password", placeholder: t.auth.passwordHint, autoComplete: "new-password" })}
        {field("confirmPassword", { type: "password", placeholder: t.auth.confirmPassword, autoComplete: "new-password" })}
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

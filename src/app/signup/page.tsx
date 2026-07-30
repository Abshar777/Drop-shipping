"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
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
      setError(data.error || "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create an Account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}
        <input
          required
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <input
          required
          type="password"
          placeholder="Password (min. 6 characters)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-orange-600 text-white font-semibold py-2.5 rounded-md hover:bg-orange-700 disabled:opacity-50"
        >
          {submitting ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      <p className="text-sm text-gray-500 text-center mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-orange-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

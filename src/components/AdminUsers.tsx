"use client";

import { useEffect, useState } from "react";

type AdminRow = { id: string; name: string; email: string };
type UserRow = { id: string; name: string; email: string; isAdmin: boolean };

const JSON_HEADERS = { "Content-Type": "application/json" };
const EMPTY_FORM = { name: "", email: "", password: "" };

export default function AdminUsers({ currentAdminId }: { currentAdminId: string }) {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [promoteId, setPromoteId] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  function load() {
    return fetch("/api/admin/admins")
      .then((res) => res.json())
      .then((data) => {
        setAdmins(Array.isArray(data.admins) ? data.admins : []);
        setUsers(Array.isArray(data.users) ? data.users : []);
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function post(body: Record<string, string>, okText: string) {
    setBusy(true);
    setNotice(null);
    const res = await fetch("/api/admin/admins", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(body) });
    const data = await res.json();
    if (res.ok) {
      setNotice({ kind: "ok", text: okText.replace("{email}", data.email) });
      setForm(EMPTY_FORM);
      setPromoteId("");
      await load();
    } else {
      setNotice({ kind: "error", text: data.error || "Something went wrong" });
    }
    setBusy(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await post(form, "Admin {email} created. They can sign in at /admin/login now.");
  }

  async function handlePromote(e: React.FormEvent) {
    e.preventDefault();
    if (!promoteId) return;
    await post({ userId: promoteId }, "{email} is now an admin and can sign in at /admin/login with their existing password.");
  }

  async function handleRemove(admin: AdminRow) {
    if (!confirm(`Remove admin access for ${admin.email}?`)) return;
    setBusy(true);
    setNotice(null);
    const res = await fetch(`/api/admin/admins/${admin.id}`, { method: "DELETE" });
    if (!res.ok) setNotice({ kind: "error", text: (await res.json()).error || "Something went wrong" });
    else setNotice({ kind: "ok", text: `Removed admin access for ${admin.email}.` });
    await load();
    setBusy(false);
  }

  const promotable = users.filter((u) => !u.isAdmin);
  const inputClass = "border border-gray-300 rounded-md px-3 py-2 text-sm bg-white";

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="flex flex-col gap-6">
      {notice && (
        <p
          className={`text-sm rounded-md px-3 py-2 border ${
            notice.kind === "ok" ? "text-green-700 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"
          }`}
        >
          {notice.text}
        </p>
      )}

      <section className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Admins</h2>
          <p className="text-xs text-gray-500">Everyone who can sign in to this dashboard.</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => {
              const isSelf = a.id === currentAdminId;
              return (
                <tr key={a.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 text-gray-900">
                    {a.name}
                    {isSelf && <span className="ms-2 text-[10px] uppercase tracking-wide bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">You</span>}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{a.email}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleRemove(a)}
                      disabled={busy || isSelf || admins.length <= 1}
                      title={isSelf ? "You cannot remove yourself" : admins.length <= 1 ? "The store needs at least one admin" : "Remove admin access"}
                      className="text-red-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-3">
          <div>
            <h2 className="font-bold text-gray-900">Add a new admin</h2>
            <p className="text-xs text-gray-500">Creates a separate admin login. Share the password with them privately.</p>
          </div>
          <input
            required
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
          <input
            required
            type="password"
            minLength={8}
            placeholder="Password (min. 8 characters)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={busy}
            className="bg-orange-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-orange-700 text-sm disabled:opacity-50"
          >
            Create admin
          </button>
        </form>

        <form onSubmit={handlePromote} className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-3">
          <div>
            <h2 className="font-bold text-gray-900">Make an existing customer an admin</h2>
            <p className="text-xs text-gray-500">
              They keep the password they already use on the storefront and sign in with it at /admin/login.
            </p>
          </div>
          {promotable.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">
              {users.length === 0 ? "No customer accounts yet." : "Every customer account is already an admin."}
            </p>
          ) : (
            <select value={promoteId} onChange={(e) => setPromoteId(e.target.value)} className={inputClass} required>
              <option value="">Choose a customer…</option>
              {promotable.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.email}
                </option>
              ))}
            </select>
          )}
          <button
            type="submit"
            disabled={busy || !promoteId}
            className="bg-gray-900 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-800 text-sm disabled:opacity-50"
          >
            Make admin
          </button>
        </form>
      </div>
    </div>
  );
}

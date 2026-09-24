import { Suspense } from "react";
import { requireAdmin } from "@/lib/require-admin";
import AdminShell from "@/components/admin/AdminShell";

// Every page in this group needs an admin session; the login page lives outside the group.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <Suspense>
      <AdminShell adminName={admin.name}>{children}</AdminShell>
    </Suspense>
  );
}

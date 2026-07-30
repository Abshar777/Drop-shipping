import { requireAdmin } from "@/lib/require-admin";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  const admin = await requireAdmin();
  return <AdminDashboard adminName={admin.name} />;
}

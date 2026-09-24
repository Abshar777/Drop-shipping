import { requireAdmin } from "@/lib/require-admin";
import DashboardHome from "@/components/admin/DashboardHome";

export default async function AdminHomePage() {
  const admin = await requireAdmin();
  return <DashboardHome adminName={admin.name} />;
}

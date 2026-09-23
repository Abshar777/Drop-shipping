import { requireAdmin } from "@/lib/require-admin";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  const admin = await requireAdmin();
  // The admin keeps a fixed light look whatever storefront theme is active.
  return (
    <div className="bg-white text-gray-900 min-h-[70vh]" style={{ colorScheme: "light" }}>
      <AdminDashboard adminName={admin.name} />
    </div>
  );
}

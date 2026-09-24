import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { COMING_SOON } from "@/lib/admin-nav";
import OrdersTable from "@/components/admin/OrdersTable";
import ProductsManager from "@/components/admin/ProductsManager";
import CategoriesManager from "@/components/admin/CategoriesManager";
import InventoryTable from "@/components/admin/InventoryTable";
import InventoryHistory from "@/components/admin/InventoryHistory";
import CustomersTable from "@/components/admin/CustomersTable";
import CustomerDetail from "@/components/admin/CustomerDetail";
import { PaymentsTable, PaymentReports } from "@/components/admin/PaymentsView";
import ReportsView, { type ReportKind } from "@/components/admin/ReportsView";
import FeaturedProducts from "@/components/admin/FeaturedProducts";
import HomepageSettings from "@/components/admin/HomepageSettings";
import ComingSoon from "@/components/admin/ComingSoon";
import ThemeSettings from "@/components/ThemeSettings";
import AdminUsers from "@/components/AdminUsers";
import { PageHeader } from "@/components/admin/ui";

type Params = { section: string[] };
type Query = Record<string, string | undefined>;

/** Routes every admin URL under /admin/* to its section. Unknown paths 404. */
export default async function AdminSectionPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Query>;
}) {
  const admin = await requireAdmin();
  const [{ section }, query] = await Promise.all([params, searchParams]);
  const path = "/admin/" + section.join("/");
  const [head, second] = section;

  switch (path) {
    case "/admin/orders":
      return <OrdersTable status={query.status} />;
    case "/admin/shipping":
      return <OrdersTable view="shipping" status={query.status} />;
    case "/admin/products":
      return <ProductsManager typeFilter={query.type === "digital" || query.type === "physical" ? query.type : undefined} />;
    case "/admin/products/new":
      return <ProductsManager openForm />;
    case "/admin/categories":
      return <CategoriesManager />;
    case "/admin/inventory":
      return <InventoryTable mode={query.filter === "low" ? "low" : "overview"} />;
    case "/admin/inventory/adjust":
      return <InventoryTable mode="adjust" />;
    case "/admin/inventory/history":
      return <InventoryHistory />;
    case "/admin/customers":
      return <CustomersTable filter={query.filter} hint={query.hint} />;
    case "/admin/payments":
      return <PaymentsTable status={query.status} />;
    case "/admin/payments/reports":
      return <PaymentReports />;
    case "/admin/website/homepage":
      return <HomepageSettings />;
    case "/admin/website/theme":
      return (
        <div>
          <PageHeader title="Theme" description="Pick a look for the storefront and fine-tune its colours, font, and corners." />
          <ThemeSettings />
        </div>
      );
    case "/admin/website/featured":
      return <FeaturedProducts />;
    case "/admin/settings/admins":
      return (
        <div>
          <PageHeader title="Admin Users" description="Who can sign in to this dashboard." />
          <AdminUsers currentAdminId={admin.id} />
        </div>
      );
  }

  if (head === "reports" && ["sales", "products", "customers", "inventory"].includes(second)) {
    return <ReportsView kind={second as ReportKind} />;
  }
  if (head === "customers" && section.length === 2 && second !== "groups") {
    return <CustomerDetail id={decodeURIComponent(second)} />;
  }
  if (COMING_SOON[path]) return <ComingSoon path={path} />;

  notFound();
}

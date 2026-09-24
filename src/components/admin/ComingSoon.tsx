import { ADMIN_NAV, COMING_SOON } from "@/lib/admin-nav";
import { PageHeader, Card } from "./ui";

/** Placeholder for sidebar entries whose feature has no data behind it yet. */
export default function ComingSoon({ path }: { path: string }) {
  const item = ADMIN_NAV.flatMap((s) => s.items ?? []).find((i) => i.href.split("?")[0] === path);
  const section = ADMIN_NAV.find((s) => s.items?.some((i) => i.href.split("?")[0] === path));
  const title = item?.label ?? "Coming soon";
  return (
    <div>
      <PageHeader title={title} description={section ? `${section.emoji} ${section.label}` : undefined} />
      <Card className="p-8 text-center max-w-xl mx-auto">
        <div className="text-4xl mb-3" aria-hidden="true">
          🛠️
        </div>
        <h2 className="font-semibold text-gray-900 mb-2">This section is planned</h2>
        <p className="text-sm text-gray-600">
          {COMING_SOON[path] ?? "This part of the admin has not been built yet."}
        </p>
      </Card>
    </div>
  );
}

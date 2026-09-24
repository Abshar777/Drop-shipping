import Link from "next/link";
import type { OrderStatus } from "@/lib/types";

/** Small shared pieces for admin pages. Server-safe (no hooks). */

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-gray-200 text-gray-700",
  refunded: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>{children}</div>;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-500 px-4 py-8 text-center">{children}</p>;
}

export function formatDate(iso: string, withTime = true) {
  const d = new Date(iso);
  return withTime
    ? d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600 mb-3">
      ← {children}
    </Link>
  );
}

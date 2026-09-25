import type { Dictionary } from "@/lib/i18n";

/** Small pill that tells shoppers whether a product is a download or something that ships. */
export default function ProductTypeBadge({ digital, t, className = "" }: { digital: boolean; t: Dictionary; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-btn ${
        digital ? "bg-primary-soft text-primary" : "border border-border text-muted"
      } ${className}`}
    >
      {digital ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8" />
        </svg>
      )}
      {digital ? t.product.digital : t.product.physical}
    </span>
  );
}

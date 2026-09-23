import type { CategoryIconName } from "@/lib/category-icons";

// Outlined 24x24 icons with a single orange accent, in the style of marketplace category bars.
// Accent shapes are listed first so the dark outline is drawn on top of them.
// No hooks and no "use client": usable from server and client components alike.

const ACCENT = "fill-orange-300 stroke-none";

const ICONS: Record<CategoryIconName, React.ReactNode> = {
  sparkles: (
    <>
      <path className={ACCENT} d="M12 7l1.1 2.9L16 11l-2.9 1.1L12 15l-1.1-2.9L8 11l2.9-1.1z" />
      <path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
      <path d="M18.5 15l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z" />
    </>
  ),
  tshirt: (
    <>
      <path className={ACCENT} d="M8.5 16h7v4h-7z" />
      <path d="M8 4l4 2 4-2 4 3-2 3-2-1v11H8V9l-2 1-2-3z" />
    </>
  ),
  dress: (
    <>
      <path className={ACCENT} d="M8.6 16.5h6.8l1 3.5H7.6z" />
      <path d="M9 3l3 3 3-3 1 5-2 2 3 10H7l3-10-2-2z" />
    </>
  ),
  hanger: (
    <>
      <path className={ACCENT} d="M6.5 16.5L12 13l5.5 3.5H6.5z" />
      <path d="M12 4a2 2 0 0 1 1 3.7L12 8v2.5" />
      <path d="M12 10.5l8 5V18H4v-2.5z" />
    </>
  ),
  shoe: (
    <>
      <path className={ACCENT} d="M3.5 16.5h17V18h-17z" />
      <path d="M3 16l1-5c3 1 5 0 7-3l2 2c2 2 5 2 8 3v3z" />
      <path d="M3 16h18v2.5H3z" />
      <path d="M12.5 9.5l1.5 1.5M14.5 8.5l1.5 1.5" />
    </>
  ),
  jewellery: (
    <>
      <path className={ACCENT} d="M9.5 8.5h5L12 11.5z" />
      <circle cx="12" cy="15" r="5" />
      <path d="M9.5 8.5L12 4l2.5 4.5" />
      <path d="M9.5 8.5h5" />
    </>
  ),
  watch: (
    <>
      <path className={ACCENT} d="M9.5 3h5v2.5h-5z" />
      <circle cx="12" cy="12" r="5" />
      <path d="M9 7.5l.6-4.5h4.8l.6 4.5M9 16.5l.6 4.5h4.8l.6-4.5" />
      <path d="M12 9.5V12l1.7 1.2" />
    </>
  ),
  mobile: (
    <>
      <path className={ACCENT} d="M7.75 17h8.5v3h-8.5z" />
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M10.5 5h3" />
    </>
  ),
  laptop: (
    <>
      <path className={ACCENT} d="M5.5 13h13v2.2h-13z" />
      <rect x="4" y="5" width="16" height="11" rx="1.5" />
      <path d="M2 19h20" />
    </>
  ),
  tv: (
    <>
      <path className={ACCENT} d="M4.5 13.5h15v2.2h-15z" />
      <rect x="3" y="5" width="18" height="12" rx="1.5" />
      <path d="M8 20.5h8M12 17v3.5" />
    </>
  ),
  beauty: (
    <>
      <path className={ACCENT} d="M10.75 10h2.5V4.6l-2.5 1.2z" />
      <rect x="9" y="11" width="6" height="10" rx="1" />
      <path d="M10 11V5l4-2v8" />
    </>
  ),
  home: (
    <>
      <path className={ACCENT} d="M6.6 11h10.8l-1.2-3H7.8z" />
      <path d="M8 4h8l3 8H5z" />
      <path d="M12 12v7M8 19h8" />
    </>
  ),
  kitchen: (
    <>
      <path className={ACCENT} d="M6.5 13h11v3h-11z" />
      <path d="M5 10h14v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z" />
      <path d="M3 10h18M9.5 7c0-1 1-1 1-2.5M14.5 7c0-1 1-1 1-2.5" />
    </>
  ),
  furniture: (
    <>
      <path className={ACCENT} d="M7 12.5h10v2.5H7z" />
      <path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
      <path d="M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3z" />
      <path d="M5 18v2M19 18v2" />
    </>
  ),
  toys: (
    <>
      <ellipse className={ACCENT} cx="12" cy="14.5" rx="2.4" ry="1.7" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="6.5" cy="7" r="2" />
      <circle cx="17.5" cy="7" r="2" />
      <circle cx="10" cy="10.5" r=".7" fill="currentColor" />
      <circle cx="14" cy="10.5" r=".7" fill="currentColor" />
    </>
  ),
  baby: (
    <>
      <path className={ACCENT} d="M8.75 14h6.5v4h-6.5z" />
      <rect x="8" y="8" width="8" height="13" rx="2" />
      <path d="M10 8V6h4v2M11 3.5h2V6h-2z" />
    </>
  ),
  grocery: (
    <>
      <path className={ACCENT} d="M8.75 11h6.5v5h-6.5z" />
      <path d="M8 8h8v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" />
      <rect x="8.5" y="4" width="7" height="3" rx=".8" />
    </>
  ),
  health: (
    <>
      <path className={ACCENT} d="M10.8 9h2.4v2.2h2.2v2.4h-2.2v2.2h-2.4v-2.2H8.6v-2.4h2.2z" />
      <path d="M12 20.5s-7.5-4.6-7.5-10.3A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.6c0 5.7-7.5 10.3-7.5 10.3z" />
    </>
  ),
  fitness: (
    <>
      <path className={ACCENT} d="M9 11h6v2H9z" />
      <path d="M4 10v4M20 10v4M7 8v8M17 8v8M7 12h10" />
    </>
  ),
  sports: (
    <>
      <circle className={ACCENT} cx="18" cy="18" r="2.5" />
      <path d="M15 3l6 6-7 7a2 2 0 0 1-3 0l-3-3a2 2 0 0 1 0-3z" />
      <path d="M8 16l-4 4" />
      <circle cx="18" cy="18" r="2.5" />
    </>
  ),
  helmet: (
    <>
      <path className={ACCENT} d="M9.5 11h9v4h-9a2 2 0 0 1 0-4z" />
      <path d="M4 13a8 8 0 0 1 16 0v4H4z" />
      <path d="M4 17h16" />
    </>
  ),
  scooter: (
    <>
      <path className={ACCENT} d="M9.4 12.5h4.6l.9 3.5H8.4z" />
      <circle cx="6" cy="17" r="2.5" />
      <circle cx="18" cy="17" r="2.5" />
      <path d="M8.5 17h7l-2.5-9H9.5" />
      <path d="M13 8h4.5" />
    </>
  ),
  book: (
    <>
      <path className={ACCENT} d="M8 7h6v2.2H8z" />
      <path d="M5 4h10a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" />
      <path d="M5 17a2 2 0 0 1 2-2h10" />
    </>
  ),
  pen: (
    <>
      <path className={ACCENT} d="M5 16.5l2.5 2.5H5z" />
      <path d="M15 4l5 5L9 20H4v-5z" />
      <path d="M13 6l5 5" />
    </>
  ),
  paw: (
    <>
      <ellipse className={ACCENT} cx="12" cy="15.5" rx="2.4" ry="1.6" />
      <ellipse cx="12" cy="15.5" rx="4" ry="3" />
      <circle cx="7" cy="10.5" r="1.5" />
      <circle cx="17" cy="10.5" r="1.5" />
      <circle cx="9.5" cy="6.5" r="1.5" />
      <circle cx="14.5" cy="6.5" r="1.5" />
    </>
  ),
  music: (
    <>
      <circle className={ACCENT} cx="7" cy="17" r="1.6" />
      <circle cx="7" cy="17" r="3" />
      <circle cx="17" cy="15" r="3" />
      <path d="M10 17V5l10-2v12" />
    </>
  ),
  bag: (
    <>
      <path className={ACCENT} d="M6.5 15.5h11V18h-11z" />
      <path d="M6 8h12l1 12H5z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  tag: (
    <>
      <circle className={ACCENT} cx="7.5" cy="8.5" r="1.8" />
      <path d="M3 12V4h8l10 10-8 8z" />
      <circle cx="7.5" cy="8.5" r="1.2" />
    </>
  ),
};

export default function CategoryIcon({
  name,
  className = "w-10 h-10",
}: {
  name: CategoryIconName;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICONS[name] ?? ICONS.tag}
    </svg>
  );
}

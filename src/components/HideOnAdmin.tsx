"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Renders children everywhere except under /admin, which has its own shell. */
export default function HideOnAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <>{children}</>;
}

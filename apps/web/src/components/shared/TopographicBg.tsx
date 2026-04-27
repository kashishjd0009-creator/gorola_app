import type { ReactElement } from "react";

import { cn } from "@/lib/utils";

type TopographicBgProps = {
  /** Line opacity 0–1; overlay lines use this on the root SVG. */
  opacity?: number;
  className?: string;
};

/**
 * Subtle topographic line pattern for hero / section backgrounds. Decorative only.
 */
export function TopographicBg({ opacity = 0.12, className }: TopographicBgProps): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full text-white", className)}
      style={{ opacity }}
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
    >
      <path
        d="M0 80 Q 50 40 100 60 T 200 50 T 400 30"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.35"
      />
      <path
        d="M0 120 Q 60 100 120 110 T 240 100 T 400 90"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.3"
      />
      <path
        d="M0 160 Q 40 150 100 150 T 220 140 T 400 130"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.25"
      />
    </svg>
  );
}

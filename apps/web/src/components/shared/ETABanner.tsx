import type { ReactElement } from "react";

import { cn } from "@/lib/utils";

type ETABannerProps = {
  /** e.g. "12–18 min" — from API later */
  etaLabel: string;
  className?: string;
};

/**
 * Amber pulse strip with live ETA text (static label until hooked to API in later phases).
 */
export function ETABanner({ etaLabel, className }: ETABannerProps): ReactElement {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-gorola-amber/40 bg-gorola-amber/10 px-3 py-2 text-gorola-charcoal",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span className="eta-pulse inline-block h-2 w-2 shrink-0 rounded-full bg-gorola-amber" aria-hidden />
      <span className="font-dm-sans text-sm">
        <span className="font-semibold">ETA</span> ~ {etaLabel}
      </span>
    </div>
  );
}

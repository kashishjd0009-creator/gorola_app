import Lenis from "lenis";

/**
 * App-wide Lenis instance. `null` until `createGorolaLenis()` runs (e.g. from
 * `useGorolaMotion`). Destroy with `destroyGorolaLenis()` in effect cleanup.
 */
export let lenis: Lenis | null = null;

/**
 * Create (or replace) the singleton with `autoRaf: false` — RAF is driven by GSAP
 * ticker in `gsap.ts`.
 */
export function createGorolaLenis(): Lenis {
  if (lenis !== null) {
    lenis.destroy();
  }
  lenis = new Lenis({ autoRaf: false });
  return lenis;
}

export function destroyGorolaLenis(): void {
  lenis?.destroy();
  lenis = null;
}

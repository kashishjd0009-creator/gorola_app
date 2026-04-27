import { useEffect } from "react";

import { initGorolaGsapOnce, linkLenisToGsapTicker } from "@/lib/gsap";
import { createGorolaLenis, destroyGorolaLenis } from "@/lib/lenis";

/**
 * Mount once: GSAP (ScrollTrigger + defaults), Lenis, ticker bridge. Tears
 * down fully on unmount (StrictMode / route changes).
 */
export function useGorolaMotion(): void {
  useEffect(() => {
    initGorolaGsapOnce();
    const instance = createGorolaLenis();
    const disconnect = linkLenisToGsapTicker(instance);
    return () => {
      disconnect();
      destroyGorolaLenis();
    };
  }, []);
}

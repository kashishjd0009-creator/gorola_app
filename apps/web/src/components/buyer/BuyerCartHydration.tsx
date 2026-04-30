import { useEffect } from "react";

import { syncBuyerCartFromServer } from "@/lib/buyer-cart-sync";
import { useAuthStore } from "@/store/auth.store";

/**
 * Keeps `useCartStore` in sync with persisted `GET /api/v1/cart` whenever the buyer session is active.
 */
export function BuyerCartHydration(): null {
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (accessToken === null) {
      return;
    }
    void syncBuyerCartFromServer().catch(() => {
      /* network errors: keep last local snapshot */
    });
  }, [accessToken]);

  return null;
}

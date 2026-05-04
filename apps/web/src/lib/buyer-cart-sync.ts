import { api } from "@/lib/api";
import { type CartLine, useCartStore } from "@/store/cart.store";

type CartGetEnvelope = {
  data?: {
    items?: unknown;
  };
  success?: boolean;
};

export function mapBuyerCartItemsToLines(items: unknown): CartLine[] {
  if (!Array.isArray(items)) {
    return [];
  }
  const lines: CartLine[] = [];
  for (const raw of items) {
    if (raw === null || typeof raw !== "object") {
      continue;
    }
    const o = raw as Record<string, unknown>;
    const vid = o.productVariantId;
    const qty = o.quantity;
    if (typeof vid !== "string" || vid.length === 0) {
      continue;
    }
    if (typeof qty !== "number" || !Number.isFinite(qty) || qty < 1) {
      continue;
    }
    const pn = o.productName;
    const vl = o.variantLabel;
    const vu = o.variantUnit;
    const up = o.unitPrice;
    const variantLabel =
      typeof vl === "string" && typeof vu === "string" && vu.length > 0
        ? `${vl} · ${vu}`
        : typeof vl === "string"
          ? vl
          : typeof vu === "string"
            ? vu
            : undefined;
    const parsed = typeof up === "string" ? Number.parseFloat(up) : typeof up === "number" ? up : NaN;
    const unitPrice = Number.isFinite(parsed) ? parsed : undefined;
    lines.push({
      ...(typeof pn === "string" ? { productName: pn } : {}),
      productVariantId: vid,
      quantity: qty,
      ...(unitPrice !== undefined ? { unitPrice } : {}),
      ...(variantLabel !== undefined ? { variantLabel } : {})
    });
  }
  return lines;
}

/** Fetches authoritative buyer cart and replaces local Zustand lines. */
export async function syncBuyerCartFromServer(): Promise<void> {
  if (api === null) {
    return;
  }
  const res = await api.get<CartGetEnvelope>("/api/v1/cart");
  const items = res.data.data?.items;
  const serverLines = mapBuyerCartItemsToLines(items);

  const localLines = useCartStore.getState().lines;

  // If server is empty but we have local items (guest cart), push them to server
  if (serverLines.length === 0 && localLines.length > 0) {
    for (const line of localLines) {
      try {
        await api.post("/api/v1/cart/items", {
          productVariantId: line.productVariantId,
          quantity: line.quantity
        });
      } catch (err) {
        console.error("Failed to sync guest line to server:", err);
      }
    }
    // No need to replaceLines yet, the next sync or local state is fine.
    // But to be safe, let's re-fetch to get the authoritative IDs/prices from server.
    const secondRes = await api.get<CartGetEnvelope>("/api/v1/cart");
    const finalLines = mapBuyerCartItemsToLines(secondRes.data.data?.items);
    useCartStore.getState().replaceLines(finalLines);
    return;
  }

  useCartStore.getState().replaceLines(serverLines);
}

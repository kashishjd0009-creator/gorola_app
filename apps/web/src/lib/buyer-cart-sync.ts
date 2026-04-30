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
  const lines = mapBuyerCartItemsToLines(items);
  useCartStore.getState().replaceLines(lines);
}

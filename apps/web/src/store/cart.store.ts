import { create } from "zustand";

export type CartLine = {
  productVariantId: string;
  quantity: number;
  productName?: string;
  variantLabel?: string;
};

type CartState = {
  lines: CartLine[];
  addOrMergeLine: (line: CartLine) => void;
  removeLine: (productVariantId: string) => void;
  setQty: (productVariantId: string, quantity: number) => void;
  clear: () => void;
  totalItemCount: () => number;
};

function mergeLine(lines: CartLine[], line: CartLine): CartLine[] {
  const idx = lines.findIndex((l) => l.productVariantId === line.productVariantId);
  if (idx === -1) {
    return [...lines, { ...line }];
  }
  const next = lines.slice();
  const existing = next[idx];
  if (existing === undefined) {
    return [...lines, { ...line }];
  }
  next[idx] = {
    ...existing,
    quantity: existing.quantity + line.quantity
  };
  return next;
}

export const useCartStore = create<CartState>((set, get) => ({
  lines: [],
  addOrMergeLine: (line) =>
    set((s) => ({
      lines: mergeLine(s.lines, line)
    })),
  removeLine: (productVariantId) =>
    set((s) => ({
      lines: s.lines.filter((l) => l.productVariantId !== productVariantId)
    })),
  setQty: (productVariantId, quantity) => {
    if (quantity <= 0) {
      get().removeLine(productVariantId);
      return;
    }
    set((s) => ({
      lines: s.lines.map((l) =>
        l.productVariantId === productVariantId ? { ...l, quantity } : l
      )
    }));
  },
  clear: () => set({ lines: [] }),
  totalItemCount: () => get().lines.reduce((acc, l) => acc + l.quantity, 0)
}));

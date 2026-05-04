import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";
import { useCartStore } from "@/store/cart.store";

import { syncBuyerCartFromServer } from "./buyer-cart-sync";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("buyer-cart-sync reconciliation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.getState().clear();
  });

  it("pushes local guest items to server if server cart is empty", async () => {
    // 1. Setup local guest cart
    useCartStore.setState({
      lines: [
        { productVariantId: "v1", quantity: 2, productName: "Apple", unitPrice: 100 },
        { productVariantId: "v2", quantity: 1, productName: "Banana", unitPrice: 50 },
      ],
    });

    // 2. Mock API: First GET returns empty, then POSTs succeed, then second GET returns the items
    const getMock = vi.mocked(api!.get);
    const postMock = vi.mocked(api!.post);

    // Initial server fetch (empty)
    getMock.mockResolvedValueOnce({
      data: { success: true, data: { items: [] } },
    });

    // Post mocks for the push logic
    postMock.mockResolvedValue({ data: { success: true } });

    // Second server fetch after push
    getMock.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          items: [
            { id: "i1", productVariantId: "v1", quantity: 2, productName: "Apple", unitPrice: "100", variantLabel: "kg", variantUnit: "1" },
            { id: "i2", productVariantId: "v2", quantity: 1, productName: "Banana", unitPrice: "50", variantLabel: "pcs", variantUnit: "1" },
          ],
        },
      },
    });

    // 3. Run sync
    await syncBuyerCartFromServer();

    // 4. Assertions
    // Should have called POST for both local items
    expect(postMock).toHaveBeenCalledTimes(2);
    expect(postMock).toHaveBeenCalledWith("/api/v1/cart/items", { productVariantId: "v1", quantity: 2 });
    expect(postMock).toHaveBeenCalledWith("/api/v1/cart/items", { productVariantId: "v2", quantity: 1 });

    // Local store should now contain the server-enriched items (with labels, etc.)
    const finalLines = useCartStore.getState().lines;
    expect(finalLines).toHaveLength(2);
    expect(finalLines[0]?.productName).toBe("Apple");
    expect(finalLines[1]?.productName).toBe("Banana");
  });

  it("replaces local items with server items if server is NOT empty (server is authority)", async () => {
    // 1. Local has one thing
    useCartStore.setState({
      lines: [{ productVariantId: "guest-item", quantity: 1 }],
    });

    // 2. Server has something else
    const getMock = vi.mocked(api!.get);
    getMock.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          items: [{ id: "server-item-1", productVariantId: "v-server", quantity: 5, productName: "Server Apple", unitPrice: "120" }],
        },
      },
    });

    // 3. Run sync
    await syncBuyerCartFromServer();

    // 4. Assertions
    // Local state should be REPLACED by server state
    const finalLines = useCartStore.getState().lines;
    expect(finalLines).toHaveLength(1);
    expect(finalLines[0]?.productVariantId).toBe("v-server");
    expect(finalLines[0]?.quantity).toBe(5);
    expect(vi.mocked(api!.post)).not.toHaveBeenCalled();
  });
});

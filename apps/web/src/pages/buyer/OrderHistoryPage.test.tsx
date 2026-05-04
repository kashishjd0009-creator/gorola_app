import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { MockInstance } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";

import { OrderHistoryPage } from "./OrderHistoryPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const mockCartOpen = vi.fn();
vi.mock("@/store/cart.store", () => ({
  useCartStore: {
    getState: () => ({ open: mockCartOpen })
  }
}));

vi.mock("@/lib/buyer-cart-sync", () => ({
  syncBuyerCartFromServer: vi.fn().mockResolvedValue(undefined)
}));

describe("OrderHistoryPage", () => {
  let apiGetSpy: MockInstance;
  let apiPostSpy: MockInstance;
  let apiPutSpy: MockInstance;

  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();

    apiGetSpy = vi.spyOn(api!, "get").mockResolvedValue({
      data: {
        data: {
          orders: [
            {
              id: "order1",
              store: { name: "Test Store" },
              total: "120.00",
              status: "DELIVERED",
              createdAt: "2026-05-01T10:00:00Z",
              items: [
                { id: "i1", productName: "Apple", quantity: 2, variantLabel: "Red" }
              ],
              rating: null,
              ratingComment: null
            },
            {
              id: "order2",
              store: { name: "Test Store 2" },
              total: "230.00",
              status: "PLACED",
              createdAt: "2026-05-01T11:00:00Z",
              items: [
                { id: "i2", productName: "Banana", quantity: 5, variantLabel: "Yellow" }
              ],
              rating: null,
              ratingComment: null
            }
          ]
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    apiPostSpy = vi.spyOn(api!, "post").mockResolvedValue({
      data: { data: { warnings: [] } }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    apiPutSpy = vi.spyOn(api!, "put").mockResolvedValue({
      data: { data: { id: "updated" } }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <OrderHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

  it("renders a list of orders", async () => {
    renderComponent();

    expect(await screen.findByText("Order History")).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText("Test Store")).toBeInTheDocument();
      expect(screen.getByText("Test Store 2")).toBeInTheDocument();
    });
    
    expect(screen.getByText("₹120.00")).toBeInTheDocument();
    expect(screen.getByText("₹230.00")).toBeInTheDocument();
    expect(screen.getByText("DELIVERED")).toBeInTheDocument();
    expect(screen.getByText("PLACED")).toBeInTheDocument();
  });

  it("triggers reorder and opens cart drawer", async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => screen.getByText("Test Store"));

    const reorderBtns = screen.getAllByRole("button", { name: /Reorder/i });
    await user.click(reorderBtns[0]!);

    await waitFor(() => {
      expect(apiPostSpy).toHaveBeenCalledWith("/api/v1/orders/order1/reorder");
      expect(mockCartOpen).toHaveBeenCalled();
    });
  });

  it("allows rating a delivered order", async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => screen.getByText("DELIVERED"));

    // Rate thumbs up
    const thumbsUpBtns = screen.getAllByRole("button", { name: /Thumbs Up/i });
    await user.click(thumbsUpBtns[0]!);

    const submitBtn = screen.getByRole("button", { name: /Submit Feedback/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(apiPutSpy).toHaveBeenCalledWith("/api/v1/orders/order1/rate", expect.objectContaining({
        rating: true
      }));
    });
  });

  it("does not show rating buttons for non-delivered orders", async () => {
    renderComponent();

    await waitFor(() => screen.getByText("PLACED"));
    
    // Test Store 2 is PLACED, it shouldn't have rating buttons next to it
    // We can check by aria-label or just seeing if they are present in the list item
    const order2Container = screen.getByText("Test Store 2").closest("div");
    expect(order2Container).not.toContainElement(screen.queryByRole("button", { name: /Thumbs Up/i }));
  });

  it("renders empty state when no orders exist", async () => {
    apiGetSpy.mockResolvedValue({
      data: { data: { orders: [] } }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("No orders yet")).toBeInTheDocument();
    });
  });

  it("only shows loading state on the specific reorder button being clicked", async () => {
    const user = userEvent.setup();
    
    // Mock a delayed response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolvePost: (value: any) => void;
    const postPromise = new Promise((resolve) => {
      resolvePost = resolve;
    });
    apiPostSpy.mockReturnValue(postPromise);

    renderComponent();
    await waitFor(() => screen.getByText("Test Store"));

    const reorderBtns = screen.getAllByRole("button", { name: /Reorder/i });
    
    // Click reorder on the first order
    await user.click(reorderBtns[0]!);

    // Check that ONLY the first button's icon is spinning
    await waitFor(() => {
      const spinningIcons = document.querySelectorAll(".animate-spin");
      expect(spinningIcons.length).toBe(1);
    });

    // Cleanup
    resolvePost!({ data: { data: { warnings: [] } } });
  });

  it("only disables rating buttons on the specific order being rated", async () => {
    const user = userEvent.setup();
    
    // Mock a delayed response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolvePut: (value: any) => void;
    const putPromise = new Promise((resolve) => {
      resolvePut = resolve;
    });
    apiPutSpy.mockReturnValue(putPromise);

    renderComponent();
    await waitFor(() => screen.getByText("DELIVERED"));

    // Click thumbs up on Order 1
    const thumbsUpBtns = screen.getAllByRole("button", { name: /Thumbs Up/i });
    await user.click(thumbsUpBtns[0]!);

    // Submit feedback
    const submitBtn = screen.getByRole("button", { name: /Submit Feedback/i });
    await user.click(submitBtn);

    // Order 1's rating buttons should be disabled
    expect(thumbsUpBtns[0]).toBeDisabled();
    
    // Order 2 is not delivered so it doesn't have rating buttons in this test setup,
    // but if we had another delivered order, its buttons should remain enabled.
    // Let's update the mock to have two delivered orders for a better test.
    apiGetSpy.mockResolvedValue({
      data: {
        data: {
          orders: [
            { id: "o1", store: { name: "S1" }, total: "10", status: "DELIVERED", createdAt: "2026-05-01T10:00:00Z", items: [], rating: null, ratingComment: null },
            { id: "o2", store: { name: "S2" }, total: "20", status: "DELIVERED", createdAt: "2026-05-01T11:00:00Z", items: [], rating: null, ratingComment: null }
          ]
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    
    // Re-render with two delivered orders
    queryClient.clear();
    renderComponent();
    await waitFor(() => screen.getByText("S1"));
    
    const s1ThumbsUp = screen.getAllByRole("button", { name: /Thumbs Up/i })[0]!;
    const s2ThumbsUp = screen.getAllByRole("button", { name: /Thumbs Up/i })[1]!;
    
    await user.click(s1ThumbsUp);
    await user.click(screen.getAllByRole("button", { name: /Submit Feedback/i })[0]!);
    
    expect(s1ThumbsUp).toBeDisabled();
    expect(s2ThumbsUp).not.toBeDisabled();

    // Cleanup
    resolvePut!({ data: { data: { id: "ok" } } });
  });
});

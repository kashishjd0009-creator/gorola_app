import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProductGrid } from "./ProductGrid";
import { useCartStore } from "@/store/cart.store";

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn()
}));

vi.mock("@/lib/api", () => ({
  api: {
    get: getMock,
    post: postMock
  }
}));

let observerCallback: ((entries: IntersectionObserverEntry[]) => void) | undefined;

class MockIntersectionObserver implements IntersectionObserver {
  public readonly root = null;
  public readonly rootMargin = "";
  public readonly thresholds = [0];

  public constructor(callback: IntersectionObserverCallback) {
    observerCallback = (entries) => {
      callback(entries, this);
    };
  }

  public disconnect(): void {}
  public observe(): void {}
  public takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  public unobserve(): void {}
}

function renderGrid(props: { categoryId?: string; storeId?: string } = {}): void {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <ProductGrid {...props} />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("ProductGrid", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    useCartStore.getState().clear();
    observerCallback = undefined;
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("shows loading skeletons first", () => {
    getMock.mockReturnValue(new Promise(() => undefined));
    renderGrid();
    expect(screen.getByText("Loading products...")).toBeInTheDocument();
    expect(screen.getAllByTestId("product-skeleton-card")).toHaveLength(12);
  });

  it("renders products from API envelope", async () => {
    getMock.mockResolvedValue({
      data: {
        success: true,
        data: {
          items: [
            {
              id: "p1",
              name: "Apple",
              highestPricedVariantId: "v-apple-1kg",
              storeId: "s1",
              storeName: "Peak Mart",
              categoryId: "c1",
              imageUrl: "https://x",
              price: "220.00",
              unit: "kg"
            }
          ],
          nextCursor: null
        }
      }
    });
    renderGrid({ categoryId: "c1" });
    expect(await screen.findByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Peak Mart")).toBeInTheDocument();
    expect(screen.getByText("Rs 220.00")).toBeInTheDocument();
  });

  it("loads next page when sentinel enters viewport", async () => {
    getMock
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            items: [
              {
                id: "p1",
                name: "Apple",
                highestPricedVariantId: "v-apple-1kg",
                storeId: "s1",
                storeName: "Peak Mart",
                categoryId: "c1",
                imageUrl: "https://x",
                price: "220.00",
                unit: "kg"
              }
            ],
            nextCursor: "cursor-1"
          }
        }
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            items: [
              {
                id: "p2",
                name: "Banana",
                highestPricedVariantId: "v-banana-dozen",
                storeId: "s1",
                storeName: "Peak Mart",
                categoryId: "c1",
                imageUrl: "https://x",
                price: "90.00",
                unit: "dozen"
              }
            ],
            nextCursor: null
          }
        }
      });

    renderGrid({ categoryId: "c1" });
    expect(await screen.findByText("Apple")).toBeInTheDocument();

    observerCallback?.([{ isIntersecting: true } as IntersectionObserverEntry]);

    expect(await screen.findByText("Banana")).toBeInTheDocument();
    expect(getMock).toHaveBeenLastCalledWith(
      "/api/v1/products",
      expect.objectContaining({
        params: expect.objectContaining({
          cursor: "cursor-1"
        })
      })
    );
  });

  it("shows empty state when API returns no products", async () => {
    getMock.mockResolvedValue({
      data: {
        success: true,
        data: {
          items: [],
          nextCursor: null
        }
      }
    });
    renderGrid();
    expect(await screen.findByText("Nothing here yet - check back soon")).toBeInTheDocument();
  });

  it("shows error state when API envelope is invalid", async () => {
    getMock.mockResolvedValue({
      data: {
        success: false
      }
    });
    renderGrid();
    expect(await screen.findByText("Couldn't load products")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("retries loading when retry button is clicked", async () => {
    getMock.mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          items: [],
          nextCursor: null
        }
      }
    });
    renderGrid();

    const retry = await screen.findByRole("button", { name: "Retry" });
    fireEvent.click(retry);

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledTimes(2);
    });
  });

  it("debounces search by 300ms before API call", async () => {
    getMock.mockResolvedValue({
      data: {
        success: true,
        data: {
          items: [],
          nextCursor: null
        }
      }
    });
    renderGrid();

    const input = await screen.findByPlaceholderText("Search products");
    await waitFor(() => {
      expect(getMock).toHaveBeenCalledTimes(1);
    });
    getMock.mockClear();

    fireEvent.change(input, { target: { value: "app" } });
    expect(getMock).toHaveBeenCalledTimes(0);
    await new Promise((resolve) => setTimeout(resolve, 350));
    expect(getMock).toHaveBeenCalledTimes(1);
  });

  it("shows add button then +/- controls with optimistic cart update", async () => {
    getMock.mockResolvedValue({
      data: {
        success: true,
        data: {
          items: [
            {
              id: "p1",
              name: "Apple",
              highestPricedVariantId: "v-apple-1kg",
              storeId: "s1",
              storeName: "Peak Mart",
              categoryId: "c1",
              imageUrl: "https://x",
              price: "220.00",
              unit: "kg"
            }
          ],
          nextCursor: null
        }
      }
    });
    postMock.mockResolvedValue({ data: { success: true } });

    renderGrid({ categoryId: "c1" });
    const addButton = await screen.findByRole("button", { name: "Add Apple to cart" });
    fireEvent.click(addButton);

    expect(screen.getByRole("button", { name: "Decrease Apple quantity" })).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Increase Apple quantity" })).toBeInTheDocument();
    expect(postMock).toHaveBeenCalledWith(
      "/api/v1/cart/items",
      expect.objectContaining({
        productVariantId: "v-apple-1kg",
        quantity: 1
      })
    );
  });
});

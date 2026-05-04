import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdvertisementBanner } from "./AdvertisementBanner";

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn()
}));

vi.mock("@/lib/api", () => ({
  api: {
    get: getMock
  }
}));

function renderBanner() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AdvertisementBanner />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("AdvertisementBanner", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("renders advertisements after fetching", async () => {
    getMock.mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: "1",
            title: "Promo 1",
            imageUrl: "https://example.com/promo1.jpg",
            linkUrl: "/promo1"
          },
          {
            id: "2",
            title: "Promo 2",
            imageUrl: "https://example.com/promo2.jpg",
            linkUrl: null
          }
        ],
        meta: { requestId: "req-1" }
      }
    });

    renderBanner();

    // Initial loading state (skeleton)
    expect(screen.getByTestId("ads-skeleton")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId("ads-skeleton")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Promo 1")).toBeInTheDocument();
    expect(screen.getByText("Promo 2")).toBeInTheDocument();
  });

  it("renders nothing if no ads are available", async () => {
    getMock.mockResolvedValue({
      data: {
        success: true,
        data: []
      }
    });

    const { container } = renderBanner() as unknown as { container: HTMLElement };

    await waitFor(() => {
      expect(screen.queryByTestId("ads-skeleton")).not.toBeInTheDocument();
    });

    expect(container.firstChild).toBeNull();
  });

  it("handles error state gracefully by rendering nothing", async () => {
    getMock.mockRejectedValue(new Error("network error"));

    const { container } = renderBanner() as unknown as { container: HTMLElement };

    await waitFor(() => {
      expect(screen.queryByTestId("ads-skeleton")).not.toBeInTheDocument();
    });

    expect(container.firstChild).toBeNull();
  });
});

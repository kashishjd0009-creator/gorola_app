/* eslint-disable simple-import-sort/imports */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { InitialEntry } from "react-router-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CheckoutPage } from "./CheckoutPage";

import { useAuthStore } from "@/store/auth.store";
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

function renderCheckout(entries: InitialEntry[] = ["/checkout"]): void {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  render(
    <MemoryRouter initialEntries={entries}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/:id" element={<div data-testid="confirmation">confirmation</div>} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("CheckoutPage", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    act(() => {
      useAuthStore.getState().setBuyerSession({
        accessToken: "at",
        name: null,
        phone: "+910000000000",
        refreshToken: "rt",
        userId: "u-test"
      });
      useCartStore.setState({
        lines: [
          {
            productName: "P",
            quantity: 1,
            productVariantId: "pv1",
            unitPrice: 100,
            variantLabel: "500g"
          }
        ]
      });
    });
    getMock.mockResolvedValue({
      data: {
        data: {
          addresses: [
            {
              id: "addr-1",
              label: "Home",
              landmarkDescription: "Near landmark text here area tenchars"
            }
          ]
        },
        success: true
      }
    });
  });

  it("does not show a postal or pin code field", async () => {
    renderCheckout();
    await waitFor(() => {
      expect(getMock).toHaveBeenCalled();
    });

    expect(screen.queryByPlaceholderText(/pin/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^pin code$/i)).not.toBeInTheDocument();
  });

  it("blocks progress when new address landmark has fewer than 10 characters", async () => {
    const user = userEvent.setup();

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByLabelText(/Deliver to new location/i)).toBeInTheDocument();
    });
    await user.click(screen.getByLabelText(/Deliver to new location/i));

    const landmark = screen.getByPlaceholderText(/Hotel Padmini|E\.g\./i);
    await user.clear(landmark);
    await user.type(landmark, "too short");

    await user.click(screen.getByRole("button", { name: /^Continue$/i }));

    expect(await screen.findByText(/at least 10 characters/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /^Review$/i })).not.toBeInTheDocument();
  });

  it("places order via POST /api/v1/orders using saved address and navigates", async () => {
    postMock.mockResolvedValueOnce({
      data: {
        data: {
          id: "order-99",
          status: "PLACED"
        },
        success: true
      }
    });
    const user = userEvent.setup();

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText(/^Deliver to:/)).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText(/^Home$/));

    await user.click(screen.getByRole("button", { name: /^Continue$/i }));

    expect(screen.getByRole("heading", { name: /^Review$/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Place Order$/i }));

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith("/api/v1/orders", {
        addressId: "addr-1",
        addressMode: "saved",
        paymentMethod: "COD"
      });
    });

    expect(await screen.findByTestId("confirmation")).toBeInTheDocument();
  });
});

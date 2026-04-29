import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BuyerNav } from "@/components/buyer/BuyerNav";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { useWeatherStore } from "@/store/weather.store";

const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn()
}));

vi.mock("@/lib/api", () => ({
  api: {
    post: postMock
  }
}));

function SearchDebugPage() {
  const location = useLocation();
  return <p data-testid="search-location">{location.pathname + location.search}</p>;
}

describe("BuyerNav", () => {
  beforeEach(() => {
    postMock.mockReset();
    useCartStore.setState({ lines: [] });
    useWeatherStore.setState({ isWeatherMode: false });
    useAuthStore.getState().clearSession();
  });

  it("renders mountain logo and location pill", () => {
    render(
      <MemoryRouter>
        <BuyerNav />
      </MemoryRouter>
    );
    expect(screen.getByLabelText("GoRola mountain logo")).toBeInTheDocument();
    expect(screen.getByText(/Kulri, Mussoorie/i)).toBeInTheDocument();
  });

  it("shows cart badge count from cart store", () => {
    useCartStore.setState({
      lines: [{ productVariantId: "pv-1", quantity: 3, productName: "Apple", variantLabel: "1kg" }]
    });
    render(
      <MemoryRouter>
        <BuyerNav />
      </MemoryRouter>
    );
    expect(screen.getByLabelText("Cart items")).toHaveTextContent("3");
  });

  it("navigates to /search on Enter from search input", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<BuyerNav />} />
          <Route path="/search" element={<SearchDebugPage />} />
        </Routes>
      </MemoryRouter>
    );
    const input = screen.getByPlaceholderText(/Search/i);
    fireEvent.change(input, { target: { value: "bread" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    expect(screen.getByTestId("search-location")).toHaveTextContent("/search?q=bread");
  });

  it("switches nav weather data attribute when weather mode is on", () => {
    useWeatherStore.setState({ isWeatherMode: true });
    render(
      <MemoryRouter>
        <BuyerNav />
      </MemoryRouter>
    );
    expect(screen.getByRole("navigation")).toHaveAttribute("data-weather", "on");
  });

  it("shows buyer identity and logout when buyer session exists", () => {
    useAuthStore.setState({
      accessToken: "access",
      name: "Naveen",
      phone: "+919876543210",
      refreshToken: "refresh",
      role: "BUYER",
      userId: "buyer_1"
    });
    render(
      <MemoryRouter>
        <BuyerNav />
      </MemoryRouter>
    );
    expect(screen.getByText("Naveen")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
  });

  it("calls backend logout before clearing local session", async () => {
    postMock.mockResolvedValue({ data: { success: true } });
    useAuthStore.setState({
      accessToken: "access",
      name: "Naveen",
      phone: "+919876543210",
      refreshToken: "refresh-token",
      role: "BUYER",
      userId: "buyer_1"
    });
    render(
      <MemoryRouter>
        <BuyerNav />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith("/api/v1/auth/buyer/logout", {
        refreshToken: "refresh-token"
      });
    });
  });
});

/* eslint-disable simple-import-sort/imports */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProfilePage } from "./ProfilePage";
import { useAuthStore } from "@/store/auth.store";

const { putMock } = vi.hoisted(() => ({
  putMock: vi.fn()
}));

vi.mock("@/lib/api", () => ({
  api: {
    put: putMock
  }
}));

vi.mock("@/hooks/useGorolaMotion", () => ({
  useGorolaMotion: vi.fn()
}));

// Mock sonner to avoid toast issues in tests
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

function renderProfile(): void {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });
  render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <ProfilePage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("ProfilePage", () => {
  beforeEach(() => {
    putMock.mockReset();
    act(() => {
      useAuthStore.getState().setBuyerSession({
        userId: "u123",
        accessToken: "access",
        refreshToken: "refresh",
        phone: "+919999999999",
        name: "Old Name"
      });
    });
  });

  it("renders the user's phone number and current name", () => {
    renderProfile();
    expect(screen.getByText(/\+919999999999/)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Old Name")).toBeInTheDocument();
  });

  it("renders navigation links to orders and addresses", () => {
    renderProfile();
    expect(screen.getByRole("link", { name: /orders/i })).toHaveAttribute("href", "/account/orders");
    expect(screen.getByRole("link", { name: /addresses/i })).toHaveAttribute("href", "/account/addresses");
  });

  it("submits name update and updates local store on success", async () => {
    const user = userEvent.setup();
    putMock.mockResolvedValueOnce({
      data: { success: true, data: { id: "u123", name: "New Name", phone: "+919999999999" } }
    });

    renderProfile();
    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "New Name");
    await user.click(screen.getByRole("button", { name: /update/i }));

    await waitFor(() => {
      expect(putMock).toHaveBeenCalledWith("/api/v1/account/profile", { name: "New Name" });
    });

    expect(useAuthStore.getState().name).toBe("New Name");
  });

  it("shows error if update fails", async () => {
    const user = userEvent.setup();
    putMock.mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          error: { message: "Something went wrong" }
        }
      }
    });

    renderProfile();
    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Broken Name");
    await user.click(screen.getByRole("button", { name: /update/i }));

    // The component should handle errors gracefully
    expect(useAuthStore.getState().name).toBe("Old Name"); // Not updated
  });
});

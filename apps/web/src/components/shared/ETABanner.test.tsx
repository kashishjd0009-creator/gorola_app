import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ETABanner } from "./ETABanner";

describe("ETABanner", () => {
  it("shows the provided ETA label", () => {
    render(<ETABanner etaLabel="12–18 min" />);
    expect(screen.getByText(/12–18 min/)).toBeInTheDocument();
  });

  it("marks the region for assistive tech", () => {
    render(<ETABanner etaLabel="~15 min" />);
    expect(screen.getByRole("status")).toHaveTextContent("ETA");
  });

  it("applies eta-pulse to the live indicator (amber banner)", () => {
    const { container } = render(<ETABanner etaLabel="10 min" />);
    const indicator = container.querySelector(".eta-pulse");
    expect(indicator).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { HomePage } from "@/pages/HomePage";

describe("buyer routes", () => {
  it("renders home for /", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<HomePage apiBaseForDisplay="https://t" />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("GoRola", { exact: false })).toBeInTheDocument();
  });
});

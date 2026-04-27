import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it } from "vitest";

import { App } from "@/App";
import { lenis } from "@/lib/lenis";

it("creates Lenis on mount and clears singleton on unmount", async () => {
  const { unmount } = render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(lenis).not.toBeNull();
  });
  unmount();
  await waitFor(() => {
    expect(lenis).toBeNull();
  });
});

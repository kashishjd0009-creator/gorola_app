import { describe, expect, it } from "vitest";

import { createAppQueryClient } from "./query-client";

describe("createAppQueryClient", () => {
  it("uses staleTime 60s and retry 2 for queries", () => {
    const client = createAppQueryClient();
    expect(client.getDefaultOptions().queries?.staleTime).toBe(60_000);
    expect(client.getDefaultOptions().queries?.retry).toBe(2);
  });
});

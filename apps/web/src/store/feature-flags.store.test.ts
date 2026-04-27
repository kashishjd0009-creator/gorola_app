import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useFeatureFlagsStore } from "./feature-flags.store";

describe("useFeatureFlagsStore", () => {
  beforeEach(() => {
    act(() => {
      useFeatureFlagsStore.getState().reset();
    });
  });

  it("defaults to empty flags", () => {
    const { result } = renderHook(() => useFeatureFlagsStore());
    expect(result.current.getFlag("pay_upi")).toBe(false);
  });

  it("setFlag updates and getFlag reads", () => {
    const { result } = renderHook(() => useFeatureFlagsStore());
    act(() => {
      result.current.setFlag("pay_upi", true);
    });
    expect(result.current.getFlag("pay_upi")).toBe(true);
  });

  it("reset clears flags", () => {
    const { result } = renderHook(() => useFeatureFlagsStore());
    act(() => {
      result.current.setFlag("x", true);
      result.current.reset();
    });
    expect(result.current.getFlag("x")).toBe(false);
  });
});

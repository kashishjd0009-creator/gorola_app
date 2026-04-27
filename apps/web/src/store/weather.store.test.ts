import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useWeatherStore } from "./weather.store";

describe("useWeatherStore", () => {
  beforeEach(() => {
    act(() => {
      useWeatherStore.getState().setWeatherMode(false);
    });
  });

  it("defaults to normal mode", () => {
    const { result } = renderHook(() => useWeatherStore());
    expect(result.current.isWeatherMode).toBe(false);
  });

  it("setWeatherMode updates state", () => {
    const { result } = renderHook(() => useWeatherStore());
    act(() => {
      result.current.setWeatherMode(true);
    });
    expect(result.current.isWeatherMode).toBe(true);
  });

  it("toggleWeather flips mode", () => {
    const { result } = renderHook(() => useWeatherStore());
    act(() => {
      result.current.toggleWeather();
    });
    expect(result.current.isWeatherMode).toBe(true);
    act(() => {
      result.current.toggleWeather();
    });
    expect(result.current.isWeatherMode).toBe(false);
  });
});

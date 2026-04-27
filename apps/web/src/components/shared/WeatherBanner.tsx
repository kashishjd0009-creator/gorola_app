import type { ReactElement } from "react";

import { cn } from "@/lib/utils";
import { useWeatherStore } from "@/store/weather.store";

/**
 * Prominent callout: normal mode (pine) vs **weather mode** (slate) using `useWeatherStore`.
 */
export function WeatherBanner(): ReactElement {
  const isWeatherMode = useWeatherStore((s) => s.isWeatherMode);

  return (
    <div
      className={cn(
        "rounded-lg px-4 py-2 text-sm text-white",
        isWeatherMode ? "bg-gorola-slate" : "bg-gorola-pine"
      )}
      data-weather={isWeatherMode ? "on" : "off"}
      role="status"
    >
      {isWeatherMode
        ? "Fog tonight — we're still coming"
        : "Skies clear — we're delivering"}
    </div>
  );
}

import { create } from "zustand";

type WeatherState = {
  isWeatherMode: boolean;
  setWeatherMode: (value: boolean) => void;
  toggleWeather: () => void;
};

export const useWeatherStore = create<WeatherState>((set) => ({
  isWeatherMode: false,
  setWeatherMode: (value) => set({ isWeatherMode: value }),
  toggleWeather: () => set((s) => ({ isWeatherMode: !s.isWeatherMode }))
}));

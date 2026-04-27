import { create } from "zustand";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (tokens: AuthTokens) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  setTokens: (tokens) => set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }),
  clearSession: () => set({ accessToken: null, refreshToken: null })
}));

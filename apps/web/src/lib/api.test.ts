import MockAdapter from "axios-mock-adapter";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createApiClient, type CreateApiClientOptions,getNormalizedApiBaseUrl } from "./api";

function opts(over: Partial<CreateApiClientOptions> = {}): CreateApiClientOptions {
  return {
    baseURL: "https://api.example",
    getAccessToken: () => "access",
    getRefreshToken: () => "refresh",
    setTokens: vi.fn(),
    clearSession: vi.fn(),
    ...over
  };
}

describe("getNormalizedApiBaseUrl", () => {
  it("trims trailing slashes", () => {
    expect(getNormalizedApiBaseUrl("https://x.com/")).toBe("https://x.com");
  });

  it("returns empty for missing or empty", () => {
    expect(getNormalizedApiBaseUrl("")).toBe("");
    expect(getNormalizedApiBaseUrl(undefined)).toBe("");
  });
});

describe("createApiClient", () => {
  let mock: MockAdapter;

  afterEach(() => {
    mock?.restore();
  });

  it("sends Authorization when access token is present", async () => {
    const client = createApiClient({
      baseURL: "https://api.example",
      getAccessToken: () => "tok",
      getRefreshToken: () => null,
      setTokens: vi.fn(),
      clearSession: vi.fn()
    });
    mock = new MockAdapter(client);
    mock.onGet("/me").reply((config) => {
      expect(config.headers?.Authorization).toBe("Bearer tok");
      return [200, { ok: true }];
    });
    const res = await client.get("/me");
    expect(res.data).toEqual({ ok: true });
  });

  it("on 401, refreshes once and retries the request", async () => {
    const setTokens = vi.fn();
    const clearSession = vi.fn();
    const client = createApiClient(
      opts({
        getAccessToken: () => "old-access",
        getRefreshToken: () => "refresh-1",
        setTokens,
        clearSession
      })
    );
    mock = new MockAdapter(client);
    mock.onGet("/data").replyOnce(401);
    mock.onGet("/data").replyOnce(200, { ok: "retry" });
    mock.onPost("/api/v1/auth/buyer/refresh").reply(200, {
      success: true,
      data: { accessToken: "new-a", refreshToken: "new-r" },
      meta: { requestId: "r" }
    });

    const res = await client.get("/data");
    expect(res.data).toEqual({ ok: "retry" });
    expect(setTokens).toHaveBeenCalledWith({ accessToken: "new-a", refreshToken: "new-r" });
    expect(clearSession).not.toHaveBeenCalled();
  });

  it("on 401, when refresh fails, clears session", async () => {
    const clearSession = vi.fn();
    const client = createApiClient(
      opts({
        getAccessToken: () => "old",
        getRefreshToken: () => "bad-refresh",
        clearSession
      })
    );
    mock = new MockAdapter(client);
    mock.onGet("/x").reply(401);
    mock.onPost("/api/v1/auth/buyer/refresh").reply(401);
    await expect(client.get("/x")).rejects.toBeTruthy();
    expect(clearSession).toHaveBeenCalled();
  });
});

import { generateKeyPairSync } from "node:crypto";

import { describe, expect, it } from "vitest";

import { createBuyerTokenService } from "../../../modules/auth/buyer-token.service.js";

describe("createBuyerTokenService", () => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const store = new Map<string, string>();
  const redis = {
    del: async (key: string) => Number(store.delete(key)),
    get: async (key: string) => store.get(key) ?? null,
    set: async (key: string, value: string, _mode: "EX", _ttl: number) => {
      void _mode;
      void _ttl;
      store.set(key, value);
    }
  };

  it("issueTokens persists refresh opaque and rotates on refresh flow", async () => {
    const svc = createBuyerTokenService({
      accessTtlSeconds: 60,
      privateKey,
      publicKey,
      redis,
      refreshTtlSeconds: 120
    });

    const first = await svc.issueTokens({ name: "Test User", phone: "+919900000099", userId: "u1" });
    expect(first.accessToken.length).toBeGreaterThan(20);
    expect(first.refreshToken.length).toBeGreaterThan(20);

    const payload = await svc.verifyAccessToken(first.accessToken);
    expect(payload.sub).toBe("u1");
    expect(payload.role).toBe("BUYER");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const second = (await svc.rotateRefreshToken(first.refreshToken)) as any;
    expect(second.accessToken.length).toBeGreaterThan(20);
    expect(second.userId).toBe("u1");
    expect(second.phone).toBe("+919900000099");

    await expect(svc.rotateRefreshToken(first.refreshToken)).rejects.toThrow();

    await svc.revokeRefreshToken(second.refreshToken);
    await expect(svc.rotateRefreshToken(second.refreshToken)).rejects.toThrow();
  });
});

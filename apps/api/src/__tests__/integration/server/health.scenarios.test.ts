import { afterEach, describe, expect, it } from "vitest";

import { API_VERSION } from "../../../lib/api-version.js";
import { buildHealthData, getHealthState } from "../../../lib/health.js";
import { createServer } from "../../../server.js";

const fixedNow = () => "2026-04-22T00:00:00.000Z";

describe("GET /api/health — status scenarios (injected probes)", () => {
  const servers: ReturnType<typeof createServer>[] = [];

  afterEach(async () => {
    await Promise.all(servers.map((s) => s.close()));
    servers.length = 0;
  });

  it("200 + ok + both checks ok", async () => {
    const server = createServer({
      disableRedis: true,
      healthProbes: {
        checkDatabase: async () => "ok",
        checkRedis: async () => "ok"
      },
      nowIso: fixedNow
    });
    servers.push(server);

    const res = await server.inject({ method: "GET", url: "/api/health" });
    const checks = { database: "ok" as const, redis: "ok" as const };
    const state = getHealthState(checks);
    const expected = buildHealthData(state, checks, API_VERSION, fixedNow);

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      success: true,
      data: expected,
      meta: { requestId: expect.any(String) }
    });
  });

  it("200 + degraded + redis error (non-critical)", async () => {
    const server = createServer({
      disableRedis: true,
      healthProbes: {
        checkDatabase: async () => "ok",
        checkRedis: async () => "error"
      },
      nowIso: fixedNow
    });
    servers.push(server);

    const res = await server.inject({ method: "GET", url: "/api/health" });
    const checks = { database: "ok" as const, redis: "error" as const };
    const state = getHealthState(checks);
    const expected = buildHealthData(state, checks, API_VERSION, fixedNow);

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      success: true,
      data: expected,
      meta: { requestId: expect.any(String) }
    });
  });

  it("503 + down + database error (critical)", async () => {
    const server = createServer({
      disableRedis: true,
      healthProbes: {
        checkDatabase: async () => "error",
        checkRedis: async () => "ok"
      },
      nowIso: fixedNow
    });
    servers.push(server);

    const res = await server.inject({ method: "GET", url: "/api/health" });
    const checks = { database: "error" as const, redis: "ok" as const };
    const state = getHealthState(checks);
    const expected = buildHealthData(state, checks, API_VERSION, fixedNow);

    expect(res.statusCode).toBe(503);
    expect(res.json()).toEqual({
      success: true,
      data: expected,
      meta: { requestId: expect.any(String) }
    });
  });

  it("uses live probes when healthProbes is not provided", async () => {
    const server = createServer({ disableRedis: true });
    servers.push(server);
    const res = await server.inject({ method: "GET", url: "/api/health" });
    expect([200, 503]).toContain(res.statusCode);
    const body = res.json() as {
      success: boolean;
      data: { status: string; version: string; timestamp: string; checks: { database: string; redis: string } };
    };
    expect(body.success).toBe(true);
    expect(typeof body.data.version).toBe("string");
    expect(typeof body.data.timestamp).toBe("string");
    expect(["ok", "error"]).toContain(body.data.checks.database);
    expect(["ok", "error"]).toContain(body.data.checks.redis);
    if (res.statusCode === 200) {
      expect(["ok", "degraded"]).toContain(body.data.status);
    } else {
      expect(body.data.status).toBe("down");
    }
  });
});

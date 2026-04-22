import { PrismaClient } from "@prisma/client";
import { Redis } from "ioredis";
import { describe, expect, it, vi } from "vitest";

import {
  buildHealthData,
  getHealthState,
  probeDatabase,
  probeRedis
} from "../../../lib/health.js";

describe("getHealthState", () => {
  it("returns ok and 200 when database and redis are ok", () => {
    expect(getHealthState({ database: "ok", redis: "ok" })).toEqual({ status: "ok", statusCode: 200 });
  });

  it("returns degraded and 200 when database is ok but redis errors (non-critical)", () => {
    expect(getHealthState({ database: "ok", redis: "error" })).toEqual({
      status: "degraded",
      statusCode: 200
    });
  });

  it("returns down and 503 when database errors (critical)", () => {
    expect(getHealthState({ database: "error", redis: "ok" })).toEqual({
      status: "down",
      statusCode: 503
    });
  });

  it("returns down and 503 when both fail (DB critical)", () => {
    expect(getHealthState({ database: "error", redis: "error" })).toEqual({
      status: "down",
      statusCode: 503
    });
  });
});

describe("buildHealthData", () => {
  it("merges state, version, fixed timestamp, and checks", () => {
    const data = buildHealthData(
      { status: "degraded", statusCode: 200 },
      { database: "ok", redis: "error" },
      "0.1.0",
      () => "2026-01-15T10:00:00.000Z"
    );
    expect(data).toEqual({
      status: "degraded",
      version: "0.1.0",
      timestamp: "2026-01-15T10:00:00.000Z",
      checks: { database: "ok", redis: "error" }
    });
  });
});

describe("probeDatabase", () => {
  it("returns ok when SELECT 1 succeeds", async () => {
    const queryRaw = vi.fn().mockResolvedValue([{ "?column?": 1 }]);
    const prisma = { $queryRaw: queryRaw } as unknown as PrismaClient;
    await expect(probeDatabase(prisma)).resolves.toBe("ok");
    expect(queryRaw).toHaveBeenCalled();
  });

  it("returns error when Prisma throws", async () => {
    const queryRaw = vi.fn().mockRejectedValue(new Error("db down"));
    const prisma = { $queryRaw: queryRaw } as unknown as PrismaClient;
    await expect(probeDatabase(prisma)).resolves.toBe("error");
  });
});

describe("probeRedis", () => {
  it("returns error when client is null", async () => {
    await expect(probeRedis(null)).resolves.toBe("error");
  });

  it("returns ok when PING returns PONG", async () => {
    const redis = { ping: vi.fn().mockResolvedValue("PONG") } as unknown as Redis;
    await expect(probeRedis(redis)).resolves.toBe("ok");
  });

  it("returns error when ping throws", async () => {
    const redis = { ping: vi.fn().mockRejectedValue(new Error("econnrefused")) } as unknown as Redis;
    await expect(probeRedis(redis)).resolves.toBe("error");
  });
});

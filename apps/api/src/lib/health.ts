import { Prisma, type PrismaClient } from "@prisma/client";
import type { Redis } from "ioredis";

export type HealthCheckResult = "ok" | "error";

export type HealthChecks = {
  database: HealthCheckResult;
  redis: HealthCheckResult;
};

export type HealthData = {
  status: "ok" | "degraded" | "down";
  version: string;
  timestamp: string;
  checks: {
    database: HealthCheckResult;
    redis: HealthCheckResult;
  };
};

export function getHealthState(checks: HealthChecks): {
  status: HealthData["status"];
  statusCode: 200 | 503;
} {
  if (checks.database === "error") {
    return { status: "down", statusCode: 503 };
  }
  if (checks.redis === "error") {
    return { status: "degraded", statusCode: 200 };
  }
  return { status: "ok", statusCode: 200 };
}

export function buildHealthData(
  state: { status: HealthData["status"]; statusCode: 200 | 503 },
  checks: HealthChecks,
  version: string,
  getTimestamp: () => string
): HealthData {
  return {
    status: state.status,
    version,
    timestamp: getTimestamp(),
    checks: { database: checks.database, redis: checks.redis }
  };
}

export async function probeDatabase(prisma: PrismaClient): Promise<HealthCheckResult> {
  try {
    await prisma.$queryRaw(Prisma.sql`SELECT 1`);
    return "ok";
  } catch {
    return "error";
  }
}

export async function probeRedis(redis: Redis | null): Promise<HealthCheckResult> {
  if (!redis) {
    return "error";
  }
  try {
    const reply = await redis.ping();
    return reply === "PONG" ? "ok" : "error";
  } catch {
    return "error";
  }
}

export async function runHealthProbes(
  prisma: PrismaClient,
  redis: Redis | null
): Promise<HealthChecks> {
  return {
    database: await probeDatabase(prisma),
    redis: await probeRedis(redis)
  };
}

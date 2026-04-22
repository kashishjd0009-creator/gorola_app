import { ValidationError } from "@gorola/shared";
import { afterEach, describe, expect, it } from "vitest";

import { API_VERSION } from "../../../lib/api-version.js";
import { createServer } from "../../../server.js";

describe("server bootstrap", () => {
  const serversToClose: Array<ReturnType<typeof createServer>> = [];

  afterEach(async () => {
    await Promise.all(serversToClose.map(async (server) => server.close()));
    serversToClose.length = 0;
  });

  it("creates a Fastify instance and serves health route envelope", async () => {
    const server = createServer();
    serversToClose.push(server);

    const response = await server.inject({
      method: "GET",
      url: "/api/health"
    });

    const body = response.json() as {
      success: boolean;
      data: { status: string; version: string; timestamp: string; checks: { database: string; redis: string } };
      meta: { requestId: string };
    };
    expect([200, 503]).toContain(response.statusCode);
    expect(body.success).toBe(true);
    expect(body.data.version).toBe(API_VERSION);
    expect(typeof body.data.timestamp).toBe("string");
    expect(["ok", "degraded", "down"]).toContain(body.data.status);
    expect(["ok", "error"]).toContain(body.data.checks.database);
    expect(["ok", "error"]).toContain(body.data.checks.redis);
    expect(body.meta.requestId).toEqual(expect.any(String));
    expect(response.headers["x-request-id"]).toEqual(expect.any(String));
  });

  it("formats AppError into standard error envelope", async () => {
    const server = createServer({
      registerRoutes: (app) => {
        app.get("/api/test-errors/app", async () => {
          throw new ValidationError("Bad payload", {
            field: "phone"
          });
        });
      }
    });
    serversToClose.push(server);

    const response = await server.inject({
      method: "GET",
      url: "/api/test-errors/app"
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Bad payload",
        details: {
          field: "phone"
        }
      },
      meta: {
        requestId: expect.any(String)
      }
    });
  });

  it("applies secure cookie flags to response cookies", async () => {
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const server = createServer({
      disableRedis: true,
      registerRoutes: (app) => {
        app.get("/api/test-cookie", async (_request, reply) => {
          reply.setCookie("session", "token-value");
          return {
            ok: true
          };
        });
      }
    });
    serversToClose.push(server);

    const response = await server.inject({
      method: "GET",
      url: "/api/test-cookie"
    });

    process.env.NODE_ENV = previousEnv;

    expect(response.statusCode).toBe(200);
    const setCookieHeader = response.headers["set-cookie"];
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    expect(cookies[0]).toEqual(expect.any(String));
    expect(cookies.some((cookie) => cookie?.includes("HttpOnly"))).toBe(true);
    expect(cookies.some((cookie) => cookie?.includes("Secure"))).toBe(true);
  });
});

import { ValidationError } from "@gorola/shared";
import { afterEach, describe, expect, it } from "vitest";

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

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      success: true,
      data: {
        status: "ok"
      },
      meta: {
        requestId: expect.any(String)
      }
    });
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

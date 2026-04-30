import { describe, expect, it } from "vitest";

import { createServer } from "../../../server.js";

describe("server cors credentials", () => {
  it("returns Access-Control-Allow-Credentials=true for allowed origin", async () => {
    const allowedOrigin = "https://allowed-origin.test";
    const previousOrigins = process.env.CORS_ALLOWED_ORIGINS;
    process.env.CORS_ALLOWED_ORIGINS = allowedOrigin;

    const server = createServer({ disableRedis: true });

    const response = await server.inject({
      method: "OPTIONS",
      url: "/api/health",
      headers: {
        origin: allowedOrigin,
        "access-control-request-method": "GET"
      }
    });

    await server.close();
    process.env.CORS_ALLOWED_ORIGINS = previousOrigins;

    expect(response.statusCode).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(allowedOrigin);
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("includes cart mutation verbs in preflight allow-methods", async () => {
    const allowedOrigin = "https://allowed-origin.test";
    const previousOrigins = process.env.CORS_ALLOWED_ORIGINS;
    process.env.CORS_ALLOWED_ORIGINS = allowedOrigin;

    const server = createServer({ disableRedis: true });

    const response = await server.inject({
      method: "OPTIONS",
      url: "/api/v1/cart/items/variant-1",
      headers: {
        origin: allowedOrigin,
        "access-control-request-method": "PUT",
        "access-control-request-headers": "content-type,authorization"
      }
    });

    await server.close();
    process.env.CORS_ALLOWED_ORIGINS = previousOrigins;

    expect(response.statusCode).toBe(204);
    const methodsHeader = (response.headers["access-control-allow-methods"] ?? "").toString().toUpperCase();
    expect(methodsHeader).toContain("PUT");
    expect(methodsHeader).toContain("DELETE");
    const allowHeaders = (response.headers["access-control-allow-headers"] ?? "").toString().toLowerCase();
    expect(allowHeaders).toContain("authorization");
    expect(allowHeaders).toContain("content-type");
  });
});

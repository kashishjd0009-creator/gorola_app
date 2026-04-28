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
});

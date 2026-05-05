import { PassThrough } from "node:stream";

import { afterEach, describe, expect, it } from "vitest";

import { createServer } from "../../../server.js";

function parseRequestCompletedLine(
  logText: string
):
  | {
      event: string;
      requestId: string;
      method: string;
      url: string;
      statusCode: number;
      responseTimeMs: number;
    }
  | undefined {
  for (const line of logText.split("\n").filter((l) => l.length > 0)) {
    const row = JSON.parse(line) as { msg?: string; event?: string };
    if (row.msg === "request completed" && row.event === "request") {
      return row as {
        event: string;
        requestId: string;
        method: string;
        url: string;
        statusCode: number;
        responseTimeMs: number;
      };
    }
  }
  return undefined;
}

describe("server request logging", () => {
  const servers: ReturnType<typeof createServer>[] = [];

  afterEach(async () => {
    await Promise.all(servers.map((s) => s.close()));
    servers.length = 0;
  });

  it("logs method, url, statusCode, responseTimeMs, and requestId for each request", async () => {
    const stream = new PassThrough();
    const parts: string[] = [];
    stream.on("data", (chunk: Buffer) => {
      parts.push(chunk.toString("utf8"));
    });

    const server = createServer({
      disableRedis: true,
      pinoTestStream: stream
    });
    servers.push(server);

    const response = await server.inject({
      method: "GET",
      url: "/api/health",
      headers: { "x-request-id": "custom-req-123" }
    });

    expect(response.statusCode).toBe(200);

    await new Promise<void>((resolve) => {
      setImmediate(() => {
        setImmediate(resolve);
      });
    });

    const line = parseRequestCompletedLine(parts.join(""));
    expect(line).toBeDefined();
    if (!line) {
      return;
    }
    expect(line.requestId).toBe("custom-req-123");
    expect(line.method).toBe("GET");
    expect(line.url).toBe("/api/health");
    expect(line.statusCode).toBe(200);
    expect(typeof line.responseTimeMs).toBe("number");
    expect(line.responseTimeMs).toBeGreaterThanOrEqual(0);
  });

  it("redacts PII phone numbers from request body logs (W-013 RED)", async () => {
    const stream = new PassThrough();
    const parts: string[] = [];
    stream.on("data", (chunk: Buffer) => {
      parts.push(chunk.toString("utf8"));
    });

    const server = createServer({
      disableRedis: true,
      pinoTestStream: stream,
      registerRoutes: (app) => {
        app.post("/api/v1/auth/buyer/send-otp", async (req, reply) => {
          req.log.info({ body: req.body }, "Manual body log");
          return reply.send({ success: true });
        });
      }
    });
    servers.push(server);

    const testPhone = "+919876543210";
    await server.inject({
      method: "POST",
      url: "/api/v1/auth/buyer/send-otp",
      payload: { phone: testPhone }
    });

    await new Promise<void>((resolve) => {
      setImmediate(() => {
        setImmediate(resolve);
      });
    });

    const logText = parts.join("");
    // Assert the literal phone number does NOT appear anywhere in the logs
    expect(logText).not.toContain(testPhone);
    expect(logText).toContain("[Redacted]");
  });
});

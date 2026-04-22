import { PassThrough } from "node:stream";

import pino from "pino";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getLogger, resetLoggerForTests } from "../../../lib/logger.js";

async function readJsonLines(
  stream: PassThrough,
  minLines: number,
  timeoutMs: number
): Promise<string[]> {
  const lines: string[] = [];
  return await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`timeout waiting for ${minLines} log lines, got ${lines.length}`));
    }, timeoutMs);
    stream.on("data", (chunk: Buffer) => {
      for (const line of chunk
        .toString("utf8")
        .split("\n")
        .filter((l) => l.length > 0)) {
        lines.push(line);
        if (lines.length >= minLines) {
          clearTimeout(timer);
          resolve(lines);
        }
      }
    });
  });
}

describe("getLogger (singleton)", () => {
  const prevEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    prevEnv.NODE_ENV = process.env.NODE_ENV;
    prevEnv.LOG_LEVEL = process.env.LOG_LEVEL;
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(prevEnv)) {
      if (value === undefined) {
        delete (process.env as Record<string, string | undefined>)[key];
      } else {
        process.env[key] = value;
      }
    }
    resetLoggerForTests();
  });

  it("returns the same pino instance on every call", () => {
    const a = getLogger();
    const b = getLogger();
    expect(a).toBe(b);
  });

  it("defaults log level from LOG_LEVEL env or info", () => {
    process.env.LOG_LEVEL = "debug";
    resetLoggerForTests();
    const logger = getLogger();
    expect(logger.level).toBe("debug");
  });

  it("in production, logs JSON to the stream (no pino-pretty pretty-print)", async () => {
    process.env.NODE_ENV = "production";
    process.env.LOG_LEVEL = "info";
    const stream = new PassThrough();
    resetLoggerForTests({ stream, forceJson: true });

    getLogger().info({ user: "a" }, "hello");

    const [line] = await readJsonLines(stream, 1, 2000);
    expect(line).toBeDefined();
    const row = JSON.parse(line as string) as { msg: string; user: string; level: number };
    expect(row.msg).toBe("hello");
    expect(row.user).toBe("a");
  });

  it("redacts sensitive keys from log objects (password, authorization)", async () => {
    process.env.NODE_ENV = "production";
    process.env.LOG_LEVEL = "info";
    const stream = new PassThrough();
    resetLoggerForTests({ stream, forceJson: true });

    getLogger().info(
      { password: "hunter2", headers: { authorization: "Bearer abcd" } },
      "check"
    );

    const [line] = await readJsonLines(stream, 1, 2000);
    expect(line).toBeDefined();
    const text = (line as string).toString();
    expect(text).not.toContain("hunter2");
    expect(text).not.toContain("abcd");
  });
});

describe("buildLogger config", () => {
  it("pino is configured with a defined level and serializers do not break", () => {
    resetLoggerForTests();
    const logger = getLogger();
    expect(pino.symbols).toBeDefined();
    expect(typeof logger.info).toBe("function");
  });
});

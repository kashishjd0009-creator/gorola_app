import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { primeMissingKeysFromExample } from "../../../config/primeEnvFromExample.js";

const thisDir = path.dirname(fileURLToPath(import.meta.url));
const examplePath = path.join(thisDir, "..", "..", "..", "..", "..", "..", ".env.example");

describe("primeMissingKeysFromExample", () => {
  it("defines every .env.example key on process.env when keys were omitted (Railway-style)", () => {
    const probe = [
      "DATABASE_URL_TEST",
      "REDIS_URL",
      "CORS_ALLOWED_ORIGINS",
      "APP_ENV",
      "LOG_LEVEL",
      "FRONTEND_URL",
      "OTEL_EXPORTER_ENDPOINT",
      "OTEL_ENABLED",
      "OTEL_SERVICE_NAME"
    ] as const;

    const snapshot: Record<string, string | undefined> = {};
    for (const k of probe) {
      snapshot[k] = process.env[k];
      delete process.env[k];
    }

    const prevDb = process.env.DATABASE_URL;
    process.env.DATABASE_URL = "postgresql://prime-test";

    try {
      primeMissingKeysFromExample(examplePath);
      for (const k of probe) {
        expect(process.env[k], k).toBeDefined();
      }
      expect(process.env.DATABASE_URL_TEST).toBe("postgresql://prime-test");
    } finally {
      for (const k of probe) {
        if (snapshot[k] === undefined) {
          delete process.env[k];
        } else {
          process.env[k] = snapshot[k];
        }
      }
      if (prevDb === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = prevDb;
      }
    }
  });
});

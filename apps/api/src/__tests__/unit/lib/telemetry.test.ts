
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import { afterEach, describe, expect, it } from "vitest";

import {
  createTraceExporterFromEnv,
  isTelemetryEnabledForTests,
  resetTelemetryForTests,
  startTelemetry
} from "../../../lib/telemetry.js";

describe("createTraceExporterFromEnv", () => {
  const prev: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const [key, value] of Object.entries(prev)) {
      if (value === undefined) {
        delete (process.env as Record<string, string | undefined>)[key];
      } else {
        process.env[key] = value;
      }
    }
    resetTelemetryForTests();
  });

  it("uses OTLP HTTP exporter when OTEL_EXPORTER_ENDPOINT is a non-empty URL", () => {
    prev.OTEL_EXPORTER_ENDPOINT = process.env.OTEL_EXPORTER_ENDPOINT;
    process.env.OTEL_EXPORTER_ENDPOINT = "http://127.0.0.1:4318/v1/traces";
    const exporter = createTraceExporterFromEnv();
    expect(exporter).toBeInstanceOf(OTLPTraceExporter);
  });

  it("uses console exporter when OTEL_EXPORTER_ENDPOINT is not set (dev / local default)", () => {
    prev.OTEL_EXPORTER_ENDPOINT = process.env.OTEL_EXPORTER_ENDPOINT;
    delete process.env.OTEL_EXPORTER_ENDPOINT;
    const exporter = createTraceExporterFromEnv();
    expect(exporter).toBeInstanceOf(ConsoleSpanExporter);
  });
});

describe("startTelemetry", () => {
  afterEach(async () => {
    await resetTelemetryForTests();
  });

  it("does not start a global SDK in Vitest (avoids test flakiness and duplicate exporters)", async () => {
    expect(process.env.VITEST).toBe("true");
    resetTelemetryForTests();
    await startTelemetry();
    expect(isTelemetryEnabledForTests()).toBe(false);
  });
});

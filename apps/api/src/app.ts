import "./config/env.js";

import { shutdownTelemetry, startTelemetry } from "./lib/telemetry.js";

export async function startApp(): Promise<void> {
  const port = Number(process.env.PORT ?? "3001");
  const host = process.env.HOST ?? "0.0.0.0";

  await startTelemetry();
  const { createServer } = await import("./server.js");
  const app = createServer();
  const closeWithTelemetry = async (): Promise<void> => {
    try {
      await app.close();
    } finally {
      await shutdownTelemetry();
    }
  };
  process.once("SIGINT", () => {
    void closeWithTelemetry();
  });
  process.once("SIGTERM", () => {
    void closeWithTelemetry();
  });
  await app.listen({ port, host });
}

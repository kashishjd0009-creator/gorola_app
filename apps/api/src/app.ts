import "./config/env.js";

import { isNodeMainModule } from "./lib/entrypoint.js";
import { shutdownTelemetry, startTelemetry } from "./lib/telemetry.js";

export async function startApp(): Promise<void> {
  const port = Number(process.env.PORT ?? "3001");
  const host = process.env.HOST ?? "0.0.0.0";

  await startTelemetry();
  const { createServer } = await import("./server.js");
  const app = createServer();
  const closeWithTelemetry = async (): Promise<void> => {
    try {
      if (typeof app.close === "function") {
        await app.close();
      }
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

if (isNodeMainModule(import.meta.url, process.argv[1])) {
  void startApp();
}

//Comment to test backend CD pipeline
import "./config/env.js";

import { isNodeMainModule } from "./lib/entrypoint.js";
import { getLogger } from "./lib/logger.js";
import { warmupExternalConnections } from "./lib/server-warmup.js";
import { shutdownTelemetry, startTelemetry } from "./lib/telemetry.js";
import { registerAppRoutes } from "./routes.js";

export async function startApp(): Promise<void> {
  const port = Number(process.env.PORT ?? "3001");
  const host = process.env.HOST ?? "0.0.0.0";

  await startTelemetry();
  try {
    await warmupExternalConnections();
  } catch (err: unknown) {
    getLogger().fatal({ err }, "startup warmup failed — database or redis unreachable");
    process.exit(1);
  }
  const { createServer } = await import("./server.js");
  const app = createServer({
    registerRoutes: registerAppRoutes
  });
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


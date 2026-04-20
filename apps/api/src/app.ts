import "./config/env.js";

import { createServer } from "./server.js";

export async function startApp(): Promise<void> {
  const port = Number(process.env.PORT ?? "3001");
  const host = process.env.HOST ?? "0.0.0.0";

  const app = createServer();
  await app.listen({ port, host });
}

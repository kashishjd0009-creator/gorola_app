import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const apiRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["src/__tests__/**/*.test.ts"],
    setupFiles: [path.join(apiRoot, "src/__tests__/setup/test-env.ts")],
    fileParallelism: false,
    pool: "forks"
  },
  resolve: {
    alias: {
      "@": path.join(apiRoot, "src")
    }
  }
});

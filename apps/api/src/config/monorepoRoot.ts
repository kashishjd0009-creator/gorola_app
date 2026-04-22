import path from "node:path";

/**
 * `env.ts` lives under `apps/api/src/config` (and compiles to `apps/api/dist/config`).
 * The monorepo root is **four** levels above the config directory: config →
 * src|dist → api → apps → root. Using three levels incorrectly stopped at
 * `…/apps` and broke dotenv paths on deploy (e.g. `/app/apps/.env.example`).
 */
export function getMonorepoRootFromThisFilePath(thisFilePath: string): string {
  return path.resolve(path.dirname(thisFilePath), "..", "..", "..", "..");
}

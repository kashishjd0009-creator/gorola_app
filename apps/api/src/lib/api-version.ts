import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const libDir = dirname(fileURLToPath(import.meta.url));

export const API_VERSION = (
  JSON.parse(readFileSync(join(libDir, "../../package.json"), "utf8")) as { version: string }
).version;

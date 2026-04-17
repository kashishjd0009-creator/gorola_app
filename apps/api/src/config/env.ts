import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenvSafe from "dotenv-safe";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);
const workspaceRoot = path.resolve(currentDirPath, "../../../");

dotenvSafe.config({
  allowEmptyValues: false,
  path: path.resolve(workspaceRoot, ".env"),
  example: path.resolve(workspaceRoot, ".env.example")
});

export {};

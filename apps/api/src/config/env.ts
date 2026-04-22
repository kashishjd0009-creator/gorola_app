import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenvSafe from "dotenv-safe";

import { getMonorepoRootFromThisFilePath } from "./monorepoRoot.js";

const currentFilePath = fileURLToPath(import.meta.url);
const workspaceRoot = getMonorepoRootFromThisFilePath(currentFilePath);

dotenvSafe.config({
  allowEmptyValues: false,
  path: path.resolve(workspaceRoot, ".env"),
  example: path.resolve(workspaceRoot, ".env.example")
});

export {};

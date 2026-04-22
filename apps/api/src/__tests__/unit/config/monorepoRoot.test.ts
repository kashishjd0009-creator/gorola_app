import path from "node:path";

import { describe, expect, it } from "vitest";

import { getMonorepoRootFromThisFilePath } from "../../../config/monorepoRoot.js";

describe("getMonorepoRootFromThisFilePath (dotenv / deploy)", () => {
  it("rises 4 levels from src/config to monorepo root (source layout)", () => {
    const repoRoot = path.join("g", "repo");
    const envFile = path.join(repoRoot, "apps", "api", "src", "config", "env.ts");
    expect(getMonorepoRootFromThisFilePath(path.resolve(envFile))).toBe(path.resolve(repoRoot));
  });

  it("rises 4 levels from dist/config to monorepo root (Node dist on Railway, etc.)", () => {
    const repoRoot = path.join("g", "repo");
    const envFile = path.join(repoRoot, "apps", "api", "dist", "config", "env.js");
    expect(getMonorepoRootFromThisFilePath(path.resolve(envFile))).toBe(path.resolve(repoRoot));
  });
});

import { fileURLToPath, pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import { isNodeMainModule } from "../../../lib/entrypoint.js";

describe("isNodeMainModule", () => {
  it("returns true when argv[1] points at the current module (POSIX path)", () => {
    const abs = "/opt/app/apps/api/dist/app.js";
    const importMetaUrl = pathToFileURL(abs).href;
    expect(isNodeMainModule(importMetaUrl, abs)).toBe(true);
  });

  it("returns true when Windows-style argv[1] matches the ESM file URL", () => {
    const winPath = "C:\\opt\\app\\dist\\app.js";
    const importMetaUrl = pathToFileURL(winPath).href;
    expect(isNodeMainModule(importMetaUrl, winPath)).toBe(true);
  });

  it("returns false when argv[1] is missing", () => {
    const importMetaUrl = pathToFileURL("/x/app.js").href;
    expect(isNodeMainModule(importMetaUrl, undefined)).toBe(false);
  });

  it("returns false when argv[1] is a different file than import.meta.url", () => {
    const importMetaUrl = pathToFileURL("/x/app.js").href;
    expect(isNodeMainModule(importMetaUrl, "/x/other.js")).toBe(false);
  });

  it("aligns with real import.meta.url for this file (round-trip)", () => {
    const thisFile = fileURLToPath(import.meta.url);
    const asUrl = import.meta.url;
    expect(isNodeMainModule(asUrl, thisFile)).toBe(true);
  });
});

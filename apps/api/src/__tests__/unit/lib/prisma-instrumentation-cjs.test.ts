import prismaCjs from "@prisma/instrumentation";
import { describe, expect, it } from "vitest";

/**
 * @prisma/instrumentation is published as CJS. Node ESM must load named exports
 * from the default export (per Node error on Railway and Node 18).
 */
describe("@prisma/instrumentation (CJS interop)", () => {
  it("exposes PrismaInstrumentation on the default export object", () => {
    expect(prismaCjs).toBeTypeOf("object");
    const mod = prismaCjs as { PrismaInstrumentation?: new () => object };
    expect(mod.PrismaInstrumentation).toBeTypeOf("function");
    expect(new mod.PrismaInstrumentation!()).toBeDefined();
  });
});

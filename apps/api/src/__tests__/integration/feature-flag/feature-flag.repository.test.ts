import { NotFoundError } from "@gorola/shared";
import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { disconnectPrisma, getPrismaClient } from "../../../lib/prisma.js";
import { FeatureFlagRepository } from "../../../modules/feature-flag/feature-flag.repository.js";

async function cleanFeatureFlagGraph(db: PrismaClient): Promise<void> {
  await db.featureFlag.deleteMany();
}

describe("FeatureFlagRepository", () => {
  const db = getPrismaClient();
  const repo = new FeatureFlagRepository(db);

  beforeEach(async () => {
    await cleanFeatureFlagGraph(db);
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  it("getAll returns flags sorted by key", async () => {
    await db.featureFlag.createMany({
      data: [
        { key: "z.flag", value: false, updatedBy: "seed" },
        { key: "a.flag", value: true, updatedBy: "seed" }
      ]
    });

    const list = await repo.getAll();
    expect(list.map((f) => f.key)).toEqual(["a.flag", "z.flag"]);
  });

  it("getByKey returns flag", async () => {
    await db.featureFlag.create({ data: { key: "feature.x", value: true, updatedBy: "seed" } });
    const flag = await repo.getByKey("feature.x");
    expect(flag?.value).toBe(true);
  });

  it("getByKey returns null when missing", async () => {
    expect(await repo.getByKey("missing")).toBeNull();
  });

  it("update changes value and updater", async () => {
    await db.featureFlag.create({ data: { key: "feature.y", value: false, updatedBy: "seed" } });
    const updated = await repo.update("feature.y", {
      value: true,
      updatedBy: "admin-1",
      description: "turned on"
    });
    expect(updated.value).toBe(true);
    expect(updated.updatedBy).toBe("admin-1");
    expect(updated.description).toBe("turned on");
  });

  it("update throws NotFoundError when key missing", async () => {
    await expect(
      repo.update("missing", { value: true, updatedBy: "admin-1" })
    ).rejects.toThrow(NotFoundError);
  });
});
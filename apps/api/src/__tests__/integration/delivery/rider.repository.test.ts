import { NotImplementedError } from "@gorola/shared";
import { afterAll, describe, expect, it } from "vitest";

import { disconnectPrisma, getPrismaClient } from "../../../lib/prisma.js";
import { RiderRepository } from "../../../modules/delivery/rider.repository.js";

describe("RiderRepository (stub)", () => {
  const db = getPrismaClient();
  const repo = new RiderRepository(db);

  afterAll(async () => {
    await disconnectPrisma();
  });

  it("create throws NotImplementedError", async () => {
    await expect(
      repo.create({ name: "Rider", phone: "+919900000001", storeId: "store_1" })
    ).rejects.toThrow(NotImplementedError);
  });

  it("getActiveByStore throws NotImplementedError", async () => {
    await expect(repo.getActiveByStore("store_1")).rejects.toThrow(NotImplementedError);
  });

  it("updateLocation throws NotImplementedError", async () => {
    await expect(
      repo.updateLocation("rider_1", { lat: "30.1234567", lng: "78.1234567" })
    ).rejects.toThrow(NotImplementedError);
  });
});
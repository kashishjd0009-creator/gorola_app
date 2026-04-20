import { NotFoundError } from "@gorola/shared";
import type { PrismaClient, User } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { disconnectPrisma, getPrismaClient } from "../../../lib/prisma.js";
import { AddressRepository } from "../../../modules/address/address.repository.js";
import { UserRepository } from "../../../modules/user/user.repository.js";

async function cleanAddressGraph(db: PrismaClient): Promise<void> {
  await db.orderStatusHistory.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.cartItem.deleteMany();
  await db.cart.deleteMany();
  await db.address.deleteMany();
  await db.user.deleteMany();
}

describe("AddressRepository", () => {
  const db = getPrismaClient();
  const userRepo = new UserRepository(db);
  const repo = new AddressRepository(db);

  let user: User;

  beforeEach(async () => {
    await cleanAddressGraph(db);
    user = await userRepo.create({ phone: "+919811111111", name: "Address User" });
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  describe("create", () => {
    it("creates address for user", async () => {
      const addr = await repo.create({
        userId: user.id,
        label: "Home",
        landmarkDescription: "Near clock tower"
      });
      expect(addr.userId).toBe(user.id);
      expect(addr.label).toBe("Home");
      expect(addr.isDefault).toBe(false);
      expect(addr.isDeleted).toBe(false);
    });

    it("creates default address and unsets previous default", async () => {
      await repo.create({
        userId: user.id,
        label: "Old Default",
        landmarkDescription: "A",
        isDefault: true
      });
      const second = await repo.create({
        userId: user.id,
        label: "New Default",
        landmarkDescription: "B",
        isDefault: true
      });

      const list = await repo.findAllByUserId(user.id, { includeDeleted: true });
      const defaults = list.filter((x) => x.isDefault);
      expect(defaults).toHaveLength(1);
      expect(defaults[0]?.id).toBe(second.id);
    });

    it("throws NotFoundError when user does not exist", async () => {
      await expect(
        repo.create({
          userId: "nonexistent_cuid_xyz",
          label: "Home",
          landmarkDescription: "X"
        })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("findAllByUserId", () => {
    it("returns non-deleted addresses by default", async () => {
      const keep = await repo.create({
        userId: user.id,
        label: "Keep",
        landmarkDescription: "A"
      });
      const del = await repo.create({
        userId: user.id,
        label: "Del",
        landmarkDescription: "B"
      });
      await repo.softDelete(del.id);

      const list = await repo.findAllByUserId(user.id);
      expect(list).toHaveLength(1);
      expect(list[0]?.id).toBe(keep.id);
    });

    it("includes deleted when includeDeleted is true", async () => {
      const del = await repo.create({
        userId: user.id,
        label: "Del",
        landmarkDescription: "B"
      });
      await repo.softDelete(del.id);

      const list = await repo.findAllByUserId(user.id, { includeDeleted: true });
      expect(list).toHaveLength(1);
      expect(list[0]?.isDeleted).toBe(true);
    });
  });

  describe("findDefault", () => {
    it("returns null when user has no default", async () => {
      await repo.create({ userId: user.id, label: "Home", landmarkDescription: "A" });
      expect(await repo.findDefault(user.id)).toBeNull();
    });

    it("returns user default address", async () => {
      const d = await repo.create({
        userId: user.id,
        label: "Default",
        landmarkDescription: "A",
        isDefault: true
      });
      const found = await repo.findDefault(user.id);
      expect(found?.id).toBe(d.id);
      expect(found?.isDefault).toBe(true);
    });

    it("ignores deleted default by default", async () => {
      const d = await repo.create({
        userId: user.id,
        label: "Default",
        landmarkDescription: "A",
        isDefault: true
      });
      await repo.softDelete(d.id);
      expect(await repo.findDefault(user.id)).toBeNull();
    });
  });

  describe("update", () => {
    it("updates fields and can set default", async () => {
      const a1 = await repo.create({ userId: user.id, label: "A1", landmarkDescription: "A" });
      await repo.create({
        userId: user.id,
        label: "Old Default",
        landmarkDescription: "B",
        isDefault: true
      });

      const updated = await repo.update(a1.id, {
        label: "Updated",
        flatRoom: "12B",
        isDefault: true
      });
      expect(updated.label).toBe("Updated");
      expect(updated.flatRoom).toBe("12B");
      expect(updated.isDefault).toBe(true);

      const defaults = (await repo.findAllByUserId(user.id, { includeDeleted: true })).filter(
        (x) => x.isDefault
      );
      expect(defaults).toHaveLength(1);
      expect(defaults[0]?.id).toBe(a1.id);
    });

    it("throws NotFoundError when address does not exist", async () => {
      await expect(repo.update("nonexistent_cuid_xyz", { label: "x" })).rejects.toThrow(NotFoundError);
    });
  });

  describe("softDelete", () => {
    it("marks address deleted and clears default", async () => {
      const d = await repo.create({
        userId: user.id,
        label: "Default",
        landmarkDescription: "A",
        isDefault: true
      });
      const deleted = await repo.softDelete(d.id);
      expect(deleted.isDeleted).toBe(true);
      expect(deleted.isDefault).toBe(false);
    });

    it("throws NotFoundError when address does not exist", async () => {
      await expect(repo.softDelete("nonexistent_cuid_xyz")).rejects.toThrow(NotFoundError);
    });
  });

  describe("security", () => {
    it("treats SQL-like label as plain text", async () => {
      const malicious = "Home'; DROP TABLE \"Address\";--";
      const addr = await repo.create({
        userId: user.id,
        label: malicious,
        landmarkDescription: "safe"
      });
      const list = await repo.findAllByUserId(user.id);
      expect(list[0]?.id).toBe(addr.id);
      expect(list[0]?.label).toBe(malicious);
      expect(await db.address.count()).toBeGreaterThanOrEqual(1);
    });
  });
});
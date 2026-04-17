import { ConflictError } from "@gorola/shared";
import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { disconnectPrisma, getPrismaClient } from "../../../lib/prisma.js";
import { AdminRepository } from "../../../modules/admin/admin.repository.js";

async function cleanAdmins(db: PrismaClient): Promise<void> {
  await db.admin.deleteMany();
}

describe("AdminRepository", () => {
  const db = getPrismaClient();
  const repo = new AdminRepository(db);

  beforeEach(async () => {
    await cleanAdmins(db);
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  describe("create", () => {
    it("creates an admin with email and passwordHash", async () => {
      const admin = await repo.create({
        email: "admin@gorola.test",
        passwordHash: "hashed_secret"
      });
      expect(admin.id).toBeTruthy();
      expect(admin.email).toBe("admin@gorola.test");
      expect(admin.passwordHash).toBe("hashed_secret");
      expect(admin.totpSecret).toBeNull();
      expect(admin.isDeleted).toBe(false);
    });

    it("creates an admin with totpSecret", async () => {
      const admin = await repo.create({
        email: "2fa@gorola.test",
        passwordHash: "hash",
        totpSecret: "BASE32SECRET"
      });
      expect(admin.totpSecret).toBe("BASE32SECRET");
    });

    it("throws ConflictError when email already exists", async () => {
      await repo.create({ email: "dup@gorola.test", passwordHash: "a" });
      await expect(
        repo.create({ email: "dup@gorola.test", passwordHash: "b" })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe("findById", () => {
    it("returns admin by id", async () => {
      const created = await repo.create({
        email: "byid@gorola.test",
        passwordHash: "h"
      });
      const found = await repo.findById(created.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
    });

    it("returns null when id does not exist", async () => {
      expect(await repo.findById("nonexistent_cuid_xyz")).toBeNull();
    });

    it("returns null for soft-deleted admin by default", async () => {
      const created = await repo.create({
        email: "del@gorola.test",
        passwordHash: "h"
      });
      await db.admin.update({ where: { id: created.id }, data: { isDeleted: true } });
      expect(await repo.findById(created.id)).toBeNull();
    });

    it("returns soft-deleted admin when includeDeleted is true", async () => {
      const created = await repo.create({
        email: "del2@gorola.test",
        passwordHash: "h"
      });
      await db.admin.update({ where: { id: created.id }, data: { isDeleted: true } });
      const found = await repo.findById(created.id, { includeDeleted: true });
      expect(found?.isDeleted).toBe(true);
    });
  });

  describe("findByEmail", () => {
    it("returns admin by email", async () => {
      await repo.create({ email: "mail@gorola.test", passwordHash: "h" });
      const found = await repo.findByEmail("mail@gorola.test");
      expect(found?.email).toBe("mail@gorola.test");
    });

    it("returns null when email does not exist", async () => {
      expect(await repo.findByEmail("missing@gorola.test")).toBeNull();
    });

    it("returns null for soft-deleted admin by default", async () => {
      const created = await repo.create({
        email: "gone@gorola.test",
        passwordHash: "h"
      });
      await db.admin.update({ where: { id: created.id }, data: { isDeleted: true } });
      expect(await repo.findByEmail("gone@gorola.test")).toBeNull();
    });

    it("returns soft-deleted admin when includeDeleted is true", async () => {
      const created = await repo.create({
        email: "gone2@gorola.test",
        passwordHash: "h"
      });
      await db.admin.update({ where: { id: created.id }, data: { isDeleted: true } });
      const found = await repo.findByEmail("gone2@gorola.test", { includeDeleted: true });
      expect(found?.isDeleted).toBe(true);
    });
  });

  describe("security", () => {
    it("does not treat SQL injection-like email string as raw SQL", async () => {
      const malicious = "admin'; DROP TABLE \"Admin\";--@x.test";
      const admin = await repo.create({
        email: malicious,
        passwordHash: "h"
      });
      const found = await repo.findByEmail(malicious);
      expect(found?.id).toBe(admin.id);
      expect(await db.admin.count()).toBeGreaterThanOrEqual(1);
    });
  });
});

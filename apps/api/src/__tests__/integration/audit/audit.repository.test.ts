import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { disconnectPrisma, getPrismaClient } from "../../../lib/prisma.js";
import { AuditRepository } from "../../../modules/audit/audit.repository.js";

async function cleanAuditGraph(db: PrismaClient): Promise<void> {
  await db.auditLog.deleteMany();
}

describe("AuditRepository", () => {
  const db = getPrismaClient();
  const repo = new AuditRepository(db);

  beforeEach(async () => {
    await cleanAuditGraph(db);
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  it("creates audit log entry", async () => {
    const log = await repo.create({
      actorId: "admin-1",
      actorRole: "ADMIN",
      action: "STORE_UPDATE",
      entityType: "Store",
      entityId: "store_1",
      oldValue: { name: "Old" },
      newValue: { name: "New" },
      ip: "127.0.0.1",
      userAgent: "vitest"
    });

    expect(log.id).toBeTruthy();
    expect(log.actorId).toBe("admin-1");
    expect(log.actorRole).toBe("ADMIN");
    expect(log.action).toBe("STORE_UPDATE");
  });

  it("persists arbitrary json payloads", async () => {
    const log = await repo.create({
      actorId: "system",
      actorRole: "SYSTEM",
      action: "BULK_JOB",
      entityType: "Order",
      entityId: "order_1",
      oldValue: { a: [1, 2] },
      newValue: { nested: { flag: true } },
      ip: "10.0.0.1",
      userAgent: "worker"
    });

    expect(log.oldValue).toEqual({ a: [1, 2] });
    expect(log.newValue).toEqual({ nested: { flag: true } });
  });

  it("treats SQL-like action string as plain text", async () => {
    const malicious = "UPDATE'; DROP TABLE \"AuditLog\";--";
    const log = await repo.create({
      actorId: "admin-2",
      actorRole: "ADMIN",
      action: malicious,
      entityType: "FeatureFlag",
      entityId: "ff_1",
      ip: "127.0.0.1",
      userAgent: "vitest"
    });

    expect(log.action).toBe(malicious);
    expect(await db.auditLog.count()).toBeGreaterThanOrEqual(1);
  });
});
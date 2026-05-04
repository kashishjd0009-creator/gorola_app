import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { disconnectPrisma, getPrismaClient } from "../../../lib/prisma.js";
import { registerAppRoutes } from "../../../routes.js";
import { createServer } from "../../../server.js";

async function cleanPromotionIntegrationGraph(db: PrismaClient): Promise<void> {
  await db.riderLocation.deleteMany();
  await db.deliveryRider.deleteMany();
  await db.orderStatusHistory.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.cartItem.deleteMany();
  await db.cart.deleteMany();
  await db.address.deleteMany();
  await db.user.deleteMany();
  await db.productVariant.deleteMany();
  await db.product.deleteMany();
  await db.storeOwner.deleteMany();
  await db.advertisement.deleteMany();
  await db.offer.deleteMany();
  await db.discount.deleteMany();
  await db.store.deleteMany();
  await db.subCategory.deleteMany();
  await db.category.deleteMany();
}

describe("Discount controller", () => {
  const db = getPrismaClient();

  beforeEach(async () => {
    await cleanPromotionIntegrationGraph(db);
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  it("POST /api/v1/promotions/discounts/validate returns amountSaved for active discount", async () => {
    await db.discount.create({
      data: {
        code: "SAVE20",
        discountType: "PERCENTAGE",
        discountValue: "20",
        startsAt: new Date("2026-01-01T00:00:00.000Z"),
        endsAt: new Date("2027-01-01T00:00:00.000Z"),
        isActive: true
      }
    });

    const server = createServer({
      disableRedis: true,
      registerRoutes: registerAppRoutes
    });

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/promotions/discounts/validate",
      payload: {
        code: "save20",
        subtotal: 500
      }
    });
    await server.close();

    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      success: boolean;
      data: { amountSaved: number; code: string; valid: boolean };
    };
    expect(body.success).toBe(true);
    expect(body.data).toMatchObject({
      amountSaved: 100,
      code: "SAVE20",
      valid: true
    });
  });

  it("POST /api/v1/promotions/discounts/validate returns invalid when code not active", async () => {
    const server = createServer({
      disableRedis: true,
      registerRoutes: registerAppRoutes
    });

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/promotions/discounts/validate",
      payload: {
        code: "UNKNOWN",
        subtotal: 500
      }
    });
    await server.close();

    expect(response.statusCode).toBe(200);
    const body = response.json() as { success: boolean; data: { valid: boolean } };
    expect(body.success).toBe(true);
    expect(body.data.valid).toBe(false);
  });
});

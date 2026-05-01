import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { disconnectPrisma, getPrismaClient } from "../../../lib/prisma.js";
import { registerAppRoutes } from "../../../routes.js";
import { createServer } from "../../../server.js";

async function getBuyerAccessToken(
  server: ReturnType<typeof createServer>,
  phone: string
): Promise<string> {
  await server.inject({ method: "POST", payload: { phone }, url: "/api/v1/auth/buyer/send-otp" });
  const verifyRes = await server.inject({
    method: "POST",
    payload: { otp: "111222", phone },
    url: "/api/v1/auth/buyer/verify-otp"
  });
  return (verifyRes.json() as { data: { accessToken: string } }).data.accessToken;
}

async function cleanOrderHistoryGraph(db: PrismaClient): Promise<void> {
  await db.stockMovement.deleteMany();
  await db.orderStatusHistory.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.productVariant.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.storeOwner.deleteMany();
  await db.advertisement.deleteMany();
  await db.offer.deleteMany();
  await db.discount.deleteMany();
  await db.store.deleteMany();
  await db.address.deleteMany();
  await db.user.deleteMany();
}

describe("GET /api/v1/orders/history", () => {
  const db = getPrismaClient();
  let server: ReturnType<typeof createServer>;
  let token: string;
  let user: { id: string };
  let store: { id: string };

  beforeEach(async () => {
    await cleanOrderHistoryGraph(db);
    process.env.GOROLA_TEST_OTP = "111222";
    server = createServer({ disableRedis: true, registerRoutes: registerAppRoutes });
    const phone = "+919988776655";
    token = await getBuyerAccessToken(server, phone);
    user = await db.user.findUniqueOrThrow({ where: { phone } });
    store = await db.store.create({
      data: { address: "Test Addr", description: "Test Desc", name: "Test Store", phone: "123" }
    });
  });

  afterAll(async () => {
    await server?.close();
    delete process.env.GOROLA_TEST_OTP;
    await disconnectPrisma();
  });

  it("returns empty array if user has no orders", async () => {
    const res = await server.inject({
      headers: { authorization: `Bearer ${token}` },
      method: "GET",
      url: "/api/v1/orders/history"
    });

    expect(res.statusCode).toBe(200);
    const body = res.json() as { data: { orders: Array<{ id: string }> } };
    expect(body.data.orders).toHaveLength(0);
  });

  it("returns user's past orders sorted by createdAt desc", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const order1 = await db.order.create({
      data: {
        deliveryFee: 20,
        landmarkDescription: "lm1",
        storeId: store.id,
        subtotal: 100,
        total: 120,
        userId: user.id,
        status: "DELIVERED",
        createdAt: yesterday
      }
    });

    const order2 = await db.order.create({
      data: {
        deliveryFee: 30,
        landmarkDescription: "lm2",
        storeId: store.id,
        subtotal: 200,
        total: 230,
        userId: user.id,
        status: "PLACED",
        createdAt: new Date()
      }
    });

    // An order for another user should not be returned
    const otherUser = await db.user.create({ data: { name: "Other", phone: "other-hist" } });
    await db.order.create({
      data: {
        deliveryFee: 0,
        landmarkDescription: "lm",
        storeId: store.id,
        subtotal: 0,
        total: 0,
        userId: otherUser.id
      }
    });

    const res = await server.inject({
      headers: { authorization: `Bearer ${token}` },
      method: "GET",
      url: "/api/v1/orders/history"
    });

    expect(res.statusCode).toBe(200);
    const body = res.json() as { data: { orders: Array<{ id: string }> } };
    
    // Should be 2 orders, sorted desc
    expect(body.data.orders).toHaveLength(2);
    expect(body.data.orders[0]?.id).toBe(order2.id); // Newer first
    expect(body.data.orders[1]?.id).toBe(order1.id);
  });
});

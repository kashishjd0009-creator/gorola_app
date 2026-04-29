import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { disconnectPrisma, getPrismaClient } from "../../../lib/prisma.js";
import { registerAppRoutes } from "../../../routes.js";
import { createServer } from "../../../server.js";

async function getBuyerAccessToken(
  server: ReturnType<typeof createServer>,
  phone: string
): Promise<string> {
  await server.inject({
    method: "POST",
    payload: { phone },
    url: "/api/v1/auth/buyer/send-otp"
  });
  const verifyRes = await server.inject({
    method: "POST",
    payload: { otp: "111222", phone },
    url: "/api/v1/auth/buyer/verify-otp"
  });
  expect(verifyRes.statusCode).toBe(200);
  return (verifyRes.json() as { data: { accessToken: string } }).data.accessToken;
}

async function cleanBuyerAddressControllerGraph(db: PrismaClient): Promise<void> {
  await db.stockMovement.deleteMany();
  await db.orderStatusHistory.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.cartItem.deleteMany();
  await db.cart.deleteMany();
  await db.address.deleteMany();
  await db.user.deleteMany();
}

describe("GET /api/v1/addresses (buyer)", () => {
  const db = getPrismaClient();

  beforeEach(async () => {
    await cleanBuyerAddressControllerGraph(db);
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  it("returns saved addresses for authenticated buyer", async () => {
    process.env.GOROLA_TEST_OTP = "111222";
    const server = createServer({
      disableRedis: true,
      registerRoutes: registerAppRoutes
    });

    const phone = "+919977665501";
    const token = await getBuyerAccessToken(server, phone);
    const user = await db.user.findUniqueOrThrow({ where: { phone } });

    await db.address.create({
      data: {
        label: "Hill home",
        landmarkDescription: "Near library landmark text area full ten",
        userId: user.id
      }
    });

    const res = await server.inject({
      headers: { authorization: `Bearer ${token}` },
      method: "GET",
      url: "/api/v1/addresses"
    });
    await server.close();
    delete process.env.GOROLA_TEST_OTP;

    expect(res.statusCode).toBe(200);
    const body = res.json() as {
      data: { addresses: Array<{ id: string; label: string; landmarkDescription: string }> };
      success: boolean;
    };
    expect(body.success).toBe(true);
    expect(body.data.addresses).toHaveLength(1);
    expect(body.data.addresses[0]?.label).toBe("Hill home");
  });
});

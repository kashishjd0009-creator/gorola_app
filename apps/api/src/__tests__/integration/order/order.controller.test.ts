import type { Category, PrismaClient, Product, ProductVariant, Store, User } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { disconnectPrisma, getPrismaClient } from "../../../lib/prisma.js";
import { CartRepository } from "../../../modules/cart/cart.repository.js";
import { CategoryRepository } from "../../../modules/catalog/category.repository.js";
import { ProductRepository } from "../../../modules/catalog/product.repository.js";
import { ProductVariantRepository } from "../../../modules/catalog/variant.repository.js";
import { StoreRepository } from "../../../modules/store/store.repository.js";
import { UserRepository } from "../../../modules/user/user.repository.js";
import { registerAppRoutes } from "../../../routes.js";
import { createServer } from "../../../server.js";

async function cleanOrderIntegrationGraph(db: PrismaClient): Promise<void> {
  await db.stockMovement.deleteMany();
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
  await db.store.deleteMany();
  await db.category.deleteMany();
}

async function getBuyerAccessToken(
  server: ReturnType<typeof createServer>,
  phone: string
): Promise<{ accessToken: string; userId: string }> {
  const sendRes = await server.inject({
    method: "POST",
    payload: { phone },
    url: "/api/v1/auth/buyer/send-otp"
  });
  expect(sendRes.statusCode).toBe(200);

  const verifyRes = await server.inject({
    method: "POST",
    payload: { otp: "111222", phone },
    url: "/api/v1/auth/buyer/verify-otp"
  });
  expect(verifyRes.statusCode).toBe(200);
  const body = verifyRes.json() as {
    data: { accessToken: string; userId: string };
  };
  return { accessToken: body.data.accessToken, userId: body.data.userId };
}

describe("POST /api/v1/orders (buyer checkout)", () => {
  const db = getPrismaClient();
  const userRepo = new UserRepository(db);
  const storeRepo = new StoreRepository(db);
  const categoryRepo = new CategoryRepository(db);
  const productRepo = new ProductRepository(db);
  const variantRepo = new ProductVariantRepository(db);
  const cartRepo = new CartRepository(db);

  let userRow: User;
  let category: Category;
  let store: Store;
  let product: Product;
  let variant: ProductVariant;

  beforeEach(async () => {
    await cleanOrderIntegrationGraph(db);
    userRow = await userRepo.ensureBuyerByPhone("+919988776099");

    category = await categoryRepo.create({
      slug: `oc-${Date.now().toString(36)}`,
      name: "OC Cat"
    });
    store = await storeRepo.create({
      address: "Mall Road",
      description: "d",
      name: "OC Store",
      phone: "+911200000099"
    });
    product = await productRepo.create({
      categoryId: category.id,
      description: "d",
      imageUrl: "https://x.jpg",
      name: "OC Product",
      storeId: store.id
    });
    variant = await variantRepo.create({
      label: "500g",
      price: "100",
      productId: product.id,
      stockQty: 20,
      unit: "pc"
    });
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  it("places order with saved address and clears cart", async () => {
    process.env.GOROLA_TEST_OTP = "111222";
    const server = createServer({
      disableRedis: true,
      registerRoutes: registerAppRoutes
    });

    const { accessToken } = await getBuyerAccessToken(server, "+919988776099");

    const addr = await db.address.create({
      data: {
        userId: userRow.id,
        label: "Home",
        landmarkDescription: "Near Clock Tower landmark area min ten"
      }
    });

    await cartRepo.addItem(userRow.id, variant.id, 2);

    const res = await server.inject({
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      method: "POST",
      payload: {
        addressId: addr.id,
        addressMode: "saved",
        paymentMethod: "COD"
      },
      url: "/api/v1/orders"
    });
    await server.close();
    delete process.env.GOROLA_TEST_OTP;

    expect(res.statusCode).toBe(200);
    const envelope = res.json() as {
      data: {
        items: unknown[];
        id: string;
        landmarkDescription: string;
        status: string;
        total: string;
      };
      success: boolean;
    };
    expect(envelope.success).toBe(true);
    expect(envelope.data.status).toBe("PLACED");
    expect(envelope.data.landmarkDescription).toBe(addr.landmarkDescription);
    expect(envelope.data.items).toHaveLength(1);

    const cartAfter = await cartRepo.findByUserId(userRow.id);
    expect(cartAfter?.items ?? []).toHaveLength(0);

    const stock = await db.productVariant.findUniqueOrThrow({ where: { id: variant.id } });
    expect(stock.stockQty).toBe(18);
  });

  it("places order with new address (min landmark) — optional saved address row", async () => {
    process.env.GOROLA_TEST_OTP = "111222";
    const server = createServer({
      disableRedis: true,
      registerRoutes: registerAppRoutes
    });

    const { accessToken } = await getBuyerAccessToken(server, "+919988776099");

    await cartRepo.addItem(userRow.id, variant.id, 1);

    const landmarkNew = "Near red gate landmark area descriptive text minimum ten chars";

    const res = await server.inject({
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      method: "POST",
      payload: {
        addressMode: "new",
        landmarkDescription: landmarkNew,
        paymentMethod: "COD",
        saveAddress: true,
        addressLabel: "Work"
      },
      url: "/api/v1/orders"
    });
    await server.close();
    delete process.env.GOROLA_TEST_OTP;

    expect(res.statusCode).toBe(200);
    const envelope = res.json() as {
      data: { landmarkDescription: string };
      success: boolean;
    };
    expect(envelope.success).toBe(true);
    expect(envelope.data.landmarkDescription).toBe(landmarkNew);

    const saved = await db.address.findFirst({
      where: { userId: userRow.id, label: "Work" }
    });
    expect(saved?.landmarkDescription).toBe(landmarkNew);
  });

  it("returns 400 when new address landmark is too short", async () => {
    process.env.GOROLA_TEST_OTP = "111222";
    const server = createServer({
      disableRedis: true,
      registerRoutes: registerAppRoutes
    });

    const { accessToken } = await getBuyerAccessToken(server, "+919988776099");
    await cartRepo.addItem(userRow.id, variant.id, 1);

    const res = await server.inject({
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      method: "POST",
      payload: {
        addressMode: "new",
        landmarkDescription: "short",
        paymentMethod: "COD"
      },
      url: "/api/v1/orders"
    });
    await server.close();
    delete process.env.GOROLA_TEST_OTP;

    expect(res.statusCode).toBe(400);
    const body = res.json() as { error: { code: string } };
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});

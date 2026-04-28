import type { Category, PrismaClient, Product, ProductVariant, Store, User } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { disconnectPrisma, getPrismaClient } from "../../../lib/prisma.js";
import { CategoryRepository } from "../../../modules/catalog/category.repository.js";
import { ProductRepository } from "../../../modules/catalog/product.repository.js";
import { ProductVariantRepository } from "../../../modules/catalog/variant.repository.js";
import { StoreRepository } from "../../../modules/store/store.repository.js";
import { UserRepository } from "../../../modules/user/user.repository.js";
import { registerAppRoutes } from "../../../routes.js";
import { createServer } from "../../../server.js";

async function cleanCartIntegrationGraph(db: PrismaClient): Promise<void> {
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
  await db.category.deleteMany();
}

describe("Cart controller", () => {
  const db = getPrismaClient();
  const userRepo = new UserRepository(db);
  const storeRepo = new StoreRepository(db);
  const categoryRepo = new CategoryRepository(db);
  const productRepo = new ProductRepository(db);
  const variantRepo = new ProductVariantRepository(db);

  let user: User;
  let store: Store;
  let category: Category;
  let product: Product;
  let variantA: ProductVariant;
  let variantB: ProductVariant;

  beforeEach(async () => {
    await cleanCartIntegrationGraph(db);
    user = await userRepo.create({ phone: "+919700000001", name: "Cart Controller User" });
    store = await storeRepo.create({
      name: "Cart Controller Store",
      description: "d",
      phone: "+911111111199",
      address: "Road"
    });
    category = await categoryRepo.create({ slug: "cart-controller-cat", name: "Cart Cat" });
    product = await productRepo.create({
      storeId: store.id,
      categoryId: category.id,
      name: "Cart Product",
      description: "d",
      imageUrl: "https://example.com/p.jpg"
    });
    variantA = await variantRepo.create({
      productId: product.id,
      label: "500g",
      price: "55",
      stockQty: 100,
      unit: "pack"
    });
    variantB = await variantRepo.create({
      productId: product.id,
      label: "1kg",
      price: "100",
      stockQty: 50,
      unit: "pack"
    });
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  it("supports cart read/mutate lifecycle through runtime routes", async () => {
    const server = createServer({
      disableRedis: true,
      registerRoutes: registerAppRoutes
    });

    const add = await server.inject({
      method: "POST",
      url: "/api/v1/cart/items",
      payload: {
        userId: user.id,
        productVariantId: variantA.id,
        quantity: 2
      }
    });
    expect(add.statusCode).toBe(200);

    const get = await server.inject({
      method: "GET",
      url: `/api/v1/cart?userId=${user.id}`
    });
    expect(get.statusCode).toBe(200);
    expect(get.json()).toEqual({
      success: true,
      data: expect.objectContaining({
        userId: user.id,
        items: expect.arrayContaining([
          expect.objectContaining({
            productVariantId: variantA.id,
            quantity: 2
          })
        ])
      }),
      meta: {
        requestId: expect.any(String)
      }
    });

    const update = await server.inject({
      method: "PUT",
      url: `/api/v1/cart/items/${variantA.id}`,
      payload: {
        userId: user.id,
        quantity: 5
      }
    });
    expect(update.statusCode).toBe(200);

    const addSecond = await server.inject({
      method: "POST",
      url: "/api/v1/cart/items",
      payload: {
        userId: user.id,
        productVariantId: variantB.id,
        quantity: 1
      }
    });
    expect(addSecond.statusCode).toBe(200);

    const remove = await server.inject({
      method: "DELETE",
      url: `/api/v1/cart/items/${variantB.id}?userId=${user.id}`
    });
    expect(remove.statusCode).toBe(200);

    const clear = await server.inject({
      method: "DELETE",
      url: `/api/v1/cart?userId=${user.id}`
    });
    expect(clear.statusCode).toBe(200);
    expect(clear.json()).toEqual({
      success: true,
      data: expect.objectContaining({
        userId: user.id,
        items: []
      }),
      meta: {
        requestId: expect.any(String)
      }
    });

    await server.close();
  });

  it("returns validation error for malformed cart payload", async () => {
    const server = createServer({
      disableRedis: true,
      registerRoutes: registerAppRoutes
    });

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/cart/items",
      payload: {
        userId: user.id,
        productVariantId: variantA.id,
        quantity: 0
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: expect.any(String),
        details: expect.any(Object)
      },
      meta: {
        requestId: expect.any(String)
      }
    });
    await server.close();
  });
});

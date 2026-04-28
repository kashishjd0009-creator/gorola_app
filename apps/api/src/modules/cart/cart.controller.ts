/* eslint-disable simple-import-sort/imports */
import { ValidationError } from "@gorola/shared";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { getPrismaClient } from "../../lib/prisma.js";

import { CartRepository } from "./cart.repository.js";

type SuccessEnvelope<T> = {
  success: true;
  data: T;
  meta: {
    requestId: string;
  };
};

const cartQuerySchema = z.object({
  userId: z.string().min(1)
});

const addCartItemBodySchema = z.object({
  userId: z.string().min(1),
  productVariantId: z.string().min(1),
  quantity: z.coerce.number().int().min(1)
});

const updateCartItemBodySchema = z.object({
  userId: z.string().min(1),
  quantity: z.coerce.number().int().min(1)
});

const cartItemParamsSchema = z.object({
  productVariantId: z.string().min(1)
});

function getRequestId(request: FastifyRequest, reply: FastifyReply): string {
  return reply.getHeader("x-request-id")?.toString() ?? request.id;
}

function success<T>(request: FastifyRequest, reply: FastifyReply, data: T): SuccessEnvelope<T> {
  return {
    success: true,
    data,
    meta: {
      requestId: getRequestId(request, reply)
    }
  };
}

export function registerCartRoutes(app: FastifyInstance): void {
  const cartRepo = new CartRepository(getPrismaClient());

  app.get("/api/v1/cart", async (request, reply) => {
    const parsed = cartQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      throw new ValidationError("Invalid cart query", parsed.error.flatten());
    }
    const cart = await cartRepo.findByUserId(parsed.data.userId);
    return success(request, reply, cart ?? { userId: parsed.data.userId, items: [] });
  });

  app.post("/api/v1/cart/items", async (request, reply) => {
    const parsed = addCartItemBodySchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid add-cart-item payload", parsed.error.flatten());
    }
    const cart = await cartRepo.addItem(parsed.data.userId, parsed.data.productVariantId, parsed.data.quantity);
    return success(request, reply, cart);
  });

  app.put("/api/v1/cart/items/:productVariantId", async (request, reply) => {
    const params = cartItemParamsSchema.safeParse(request.params);
    const body = updateCartItemBodySchema.safeParse(request.body);
    if (!params.success || !body.success) {
      throw new ValidationError("Invalid update-cart-item payload", {
        params: params.success ? undefined : params.error.flatten(),
        body: body.success ? undefined : body.error.flatten()
      });
    }
    const cart = await cartRepo.updateQty(body.data.userId, params.data.productVariantId, body.data.quantity);
    return success(request, reply, cart);
  });

  app.delete("/api/v1/cart/items/:productVariantId", async (request, reply) => {
    const params = cartItemParamsSchema.safeParse(request.params);
    const query = cartQuerySchema.safeParse(request.query);
    if (!params.success || !query.success) {
      throw new ValidationError("Invalid remove-cart-item payload", {
        params: params.success ? undefined : params.error.flatten(),
        query: query.success ? undefined : query.error.flatten()
      });
    }
    const cart = await cartRepo.removeItem(query.data.userId, params.data.productVariantId);
    return success(request, reply, cart);
  });

  app.delete("/api/v1/cart", async (request, reply) => {
    const query = cartQuerySchema.safeParse(request.query);
    if (!query.success) {
      throw new ValidationError("Invalid clear-cart query", query.error.flatten());
    }
    const cart = await cartRepo.clearCart(query.data.userId);
    return success(request, reply, cart);
  });
}

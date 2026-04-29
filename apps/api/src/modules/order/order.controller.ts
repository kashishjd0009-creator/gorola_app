/* eslint-disable simple-import-sort/imports */
import { UnauthorizedError } from "@gorola/shared";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import type { AccessTokenVerifier } from "../auth/auth.types.js";

import type { BuyerCheckoutService } from "./buyer-checkout.service.js";
import type { OrderWithRelations } from "./order.repository.js";
import { parsePlaceBuyerOrderBody } from "./order.schema.js";

type SuccessEnvelope<T> = {
  success: true;
  data: T;
  meta: {
    requestId: string;
  };
};

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

function serializeOrderResponse(order: OrderWithRelations): Record<string, unknown> {
  return {
    createdAt: order.createdAt.toISOString(),
    deliveryFee: order.deliveryFee.toString(),
    deliveryNote: order.deliveryNote,
    id: order.id,
    items: order.items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      price: item.price.toString(),
      productName: item.productName,
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      variantLabel: item.variantLabel
    })),
    landmarkDescription: order.landmarkDescription,
    paymentMethod: order.paymentMethod,
    scheduledFor: order.scheduledFor?.toISOString() ?? null,
    status: order.status,
    statusHistory: order.statusHistory.map((h) => ({
      changedAt: h.changedAt.toISOString(),
      changedBy: h.changedBy,
      id: h.id,
      note: h.note,
      orderId: h.orderId,
      status: h.status
    })),
    storeId: order.storeId,
    subtotal: order.subtotal.toString(),
    total: order.total.toString(),
    updatedAt: order.updatedAt.toISOString(),
    userId: order.userId
  };
}

type RegisterOrderDeps = {
  buyerCheckout: BuyerCheckoutService;
  tokenVerifier: AccessTokenVerifier;
};

export function registerOrderRoutes(app: FastifyInstance, deps: RegisterOrderDeps): void {
  const preCheckout = [requireAuth(deps.tokenVerifier), requireRole(["BUYER"])];

  app.post(
    "/api/v1/orders",
    { preHandler: preCheckout },
    async (request, reply) => {
      const parsed = parsePlaceBuyerOrderBody(request.body);
      const buyerId = request.user?.sub;
      if (!buyerId) {
        throw new UnauthorizedError("Buyer subject missing");
      }
      const placed = await deps.buyerCheckout.placeFromCart(buyerId, parsed);
      return success(request, reply, serializeOrderResponse(placed));
    }
  );
}

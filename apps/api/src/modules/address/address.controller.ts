/* eslint-disable simple-import-sort/imports */
import { UnauthorizedError, ValidationError } from "@gorola/shared";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import type { AccessTokenVerifier } from "../auth/auth.types.js";

import { AddressRepository } from "./address.repository.js";
import { addressIdParamsSchema, createAddressSchema, updateAddressSchema } from "./address.schema.js";

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

function serializeBuyerAddress(a: {
  createdAt: Date;
  flatRoom: string | null;
  id: string;
  isDefault: boolean;
  label: string;
  landmarkDescription: string;
  lat: import("@prisma/client").Prisma.Decimal | null;
  lng: import("@prisma/client").Prisma.Decimal | null;
  updatedAt: Date;
  userId: string;
}): Record<string, unknown> {
  return {
    createdAt: a.createdAt.toISOString(),
    flatRoom: a.flatRoom,
    id: a.id,
    isDefault: a.isDefault,
    label: a.label,
    landmarkDescription: a.landmarkDescription,
    lat: a.lat?.toString() ?? null,
    lng: a.lng?.toString() ?? null,
    updatedAt: a.updatedAt.toISOString(),
    userId: a.userId
  };
}

type RegisterBuyerAddressDeps = {
  addresses: AddressRepository;
  tokenVerifier: AccessTokenVerifier;
};

export function registerBuyerAddressRoutes(app: FastifyInstance, deps: RegisterBuyerAddressDeps): void {
  const pre = [requireAuth(deps.tokenVerifier), requireRole(["BUYER"])];

  app.get(
    "/api/v1/addresses",
    { preHandler: pre },
    async (request, reply) => {
      const buyerId = request.user?.sub;
      if (!buyerId) {
        throw new UnauthorizedError("Buyer subject missing");
      }
      const rows = await deps.addresses.findAllByUserId(buyerId);
      return success(request, reply, {
        addresses: rows.map((a) => serializeBuyerAddress(a))
      });
    }
  );

  app.post(
    "/api/v1/addresses",
    { preHandler: pre },
    async (request, reply) => {
      const parsed = createAddressSchema.body.safeParse(request.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid address payload", parsed.error.flatten());
      }
      
      const buyerId = request.user?.sub;
      if (!buyerId) {
        throw new UnauthorizedError("Buyer subject missing");
      }
      
      const created = await deps.addresses.create({
        userId: buyerId,
        label: parsed.data.label,
        landmarkDescription: parsed.data.landmarkDescription,
        flatRoom: parsed.data.flatRoom ?? null,
        lat: parsed.data.lat ?? null,
        lng: parsed.data.lng ?? null,
        isDefault: parsed.data.isDefault ?? false,
      });

      return success(request, reply, serializeBuyerAddress(created));
    }
  );

  app.put(
    "/api/v1/addresses/:id",
    { preHandler: pre },
    async (request, reply) => {
      const paramsParsed = updateAddressSchema.params.safeParse(request.params);
      const bodyParsed = updateAddressSchema.body.safeParse(request.body);
      
      if (!paramsParsed.success || !bodyParsed.success) {
        throw new ValidationError("Invalid payload", {
          params: paramsParsed.success ? undefined : paramsParsed.error.flatten(),
          body: bodyParsed.success ? undefined : bodyParsed.error.flatten()
        });
      }

      const buyerId = request.user?.sub;
      if (!buyerId) {
        throw new UnauthorizedError("Buyer subject missing");
      }

      const existing = await deps.addresses.findByIdForBuyer(buyerId, paramsParsed.data.id);
      if (!existing) {
        throw new UnauthorizedError("Address not found or does not belong to you");
      }

      const updateData: Parameters<typeof deps.addresses.update>[1] = {};
      if (bodyParsed.data.label !== undefined) updateData.label = bodyParsed.data.label;
      if (bodyParsed.data.landmarkDescription !== undefined) updateData.landmarkDescription = bodyParsed.data.landmarkDescription;
      if (bodyParsed.data.flatRoom !== undefined) updateData.flatRoom = bodyParsed.data.flatRoom ?? null;
      if (bodyParsed.data.lat !== undefined) updateData.lat = bodyParsed.data.lat ?? null;
      if (bodyParsed.data.lng !== undefined) updateData.lng = bodyParsed.data.lng ?? null;
      if (bodyParsed.data.isDefault !== undefined) updateData.isDefault = bodyParsed.data.isDefault;

      const updated = await deps.addresses.update(paramsParsed.data.id, updateData);
      return success(request, reply, serializeBuyerAddress(updated));
    }
  );

  app.delete(
    "/api/v1/addresses/:id",
    { preHandler: pre },
    async (request, reply) => {
      const paramsParsed = addressIdParamsSchema.params.safeParse(request.params);
      if (!paramsParsed.success) {
        throw new ValidationError("Invalid payload", paramsParsed.error.flatten());
      }

      const buyerId = request.user?.sub;
      if (!buyerId) {
        throw new UnauthorizedError("Buyer subject missing");
      }

      const existing = await deps.addresses.findByIdForBuyer(buyerId, paramsParsed.data.id);
      if (!existing) {
        throw new UnauthorizedError("Address not found or does not belong to you");
      }

      await deps.addresses.softDelete(paramsParsed.data.id);
      return success(request, reply, { id: paramsParsed.data.id, deleted: true });
    }
  );

  app.put(
    "/api/v1/addresses/:id/default",
    { preHandler: pre },
    async (request, reply) => {
      const paramsParsed = addressIdParamsSchema.params.safeParse(request.params);
      if (!paramsParsed.success) {
        throw new ValidationError("Invalid payload", paramsParsed.error.flatten());
      }

      const buyerId = request.user?.sub;
      if (!buyerId) {
        throw new UnauthorizedError("Buyer subject missing");
      }

      const existing = await deps.addresses.findByIdForBuyer(buyerId, paramsParsed.data.id);
      if (!existing) {
        throw new UnauthorizedError("Address not found or does not belong to you");
      }

      const updated = await deps.addresses.update(paramsParsed.data.id, { isDefault: true });
      return success(request, reply, serializeBuyerAddress(updated));
    }
  );
}

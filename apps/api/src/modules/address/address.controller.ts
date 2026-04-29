/* eslint-disable simple-import-sort/imports */
import { UnauthorizedError } from "@gorola/shared";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import type { AccessTokenVerifier } from "../auth/auth.types.js";

import { AddressRepository } from "./address.repository.js";

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
}

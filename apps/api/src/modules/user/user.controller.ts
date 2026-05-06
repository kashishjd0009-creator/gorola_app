/* eslint-disable simple-import-sort/imports */
import { UnauthorizedError } from "@gorola/shared";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import type { AccessTokenVerifier } from "../auth/auth.types.js";
import type { UserRepository } from "./user.repository.js";
import { parseUpdateProfileInput } from "./user.schema.js";

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

export type RegisterUserDeps = {
  userRepository: UserRepository;
  tokenVerifier: AccessTokenVerifier;
};

export function registerUserRoutes(app: FastifyInstance, deps: RegisterUserDeps): void {
  const buyerGuard = [requireAuth(deps.tokenVerifier), requireRole(["BUYER"])];

  app.put(
    "/api/v1/account/profile",
    { preHandler: buyerGuard },
    async (request, reply) => {
      const payload = parseUpdateProfileInput(request.body);
      const userId = request.user?.sub;
      if (!userId) {
        throw new UnauthorizedError("User subject missing");
      }

      const updated = await deps.userRepository.update(userId, { name: payload.name });

      return success(request, reply, {
        id: updated.id,
        name: updated.name,
        phone: updated.phone
      });
    }
  );
}

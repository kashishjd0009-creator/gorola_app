import { ForbiddenError, UnauthorizedError } from "@gorola/shared";
import type { FastifyReply, FastifyRequest } from "fastify";

import type { AccessTokenPayload, AccessTokenVerifier } from "./auth.types.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: AccessTokenPayload;
  }
}

export function requireAuth(tokenVerifier: AccessTokenVerifier) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    void reply;
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or invalid Authorization header");
    }

    const accessToken = authHeader.slice("Bearer ".length).trim();
    if (!accessToken) {
      throw new UnauthorizedError("Missing bearer token");
    }

    request.user = await tokenVerifier.verifyAccessToken(accessToken);
  };
}

export function requireRole(roles: AccessTokenPayload["role"][]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    void reply;
    const user = request.user;
    if (!user) {
      throw new UnauthorizedError("Authentication required");
    }
    if (!roles.includes(user.role)) {
      throw new ForbiddenError("Insufficient role");
    }
  };
}

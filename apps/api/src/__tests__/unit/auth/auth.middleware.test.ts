import { ForbiddenError, UnauthorizedError } from "@gorola/shared";
import type { FastifyReply, FastifyRequest } from "fastify";
import { describe, expect, it, vi } from "vitest";

import { requireAuth, requireRole } from "../../../modules/auth/auth.middleware.js";

type AuthRequest = FastifyRequest & {
  user?: {
    role: "ADMIN" | "BUYER" | "STORE_OWNER";
    sub: string;
  };
};

describe("auth middleware", () => {
  it("requireAuth should attach user from bearer token", async () => {
    const request = {
      headers: { authorization: "Bearer access-token" }
    } as FastifyRequest;
    const reply = {} as FastifyReply;
    const verifyAccessToken = vi.fn().mockResolvedValueOnce({
      role: "BUYER",
      sub: "user-1"
    });
    const middleware = requireAuth({
      verifyAccessToken
    });

    await middleware(request, reply);

    expect(verifyAccessToken).toHaveBeenCalledWith("access-token");
    expect((request as AuthRequest).user).toEqual({
      role: "BUYER",
      sub: "user-1"
    });
  });

  it("requireAuth should throw UnauthorizedError when authorization header is missing", async () => {
    const middleware = requireAuth({
      verifyAccessToken: vi.fn()
    });

    await expect(middleware({ headers: {} } as FastifyRequest, {} as FastifyReply)).rejects.toBeInstanceOf(
      UnauthorizedError
    );
  });

  it("requireRole should throw ForbiddenError for disallowed role", async () => {
    const request = {
      user: {
        role: "BUYER",
        sub: "buyer-1"
      }
    } as AuthRequest;

    await expect(requireRole(["ADMIN"])(request, {} as FastifyReply)).rejects.toBeInstanceOf(
      ForbiddenError
    );
  });
});

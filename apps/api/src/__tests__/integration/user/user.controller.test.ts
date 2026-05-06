import type { FastifyInstance } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";

// @ts-expect-error - will be created in next step
import { registerUserRoutes } from "../../../modules/user/user.controller.js";
import { createServer } from "../../../server.js";

type UserRepositoryMock = {
  update: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
};

type TokenVerifierMock = {
  verifyAccessToken: ReturnType<typeof vi.fn>;
};

function createUserRepositoryMock(): UserRepositoryMock {
  return {
    update: vi.fn(),
    findById: vi.fn(),
  };
}

function createTokenVerifierMock(): TokenVerifierMock {
  return {
    verifyAccessToken: vi.fn(),
  };
}

describe("user controller routes", () => {
  const servers: FastifyInstance[] = [];

  afterEach(async () => {
    await Promise.all(servers.map(async (server) => server.close()));
    servers.length = 0;
  });

  describe("PUT /api/v1/account/profile", () => {
    it("should update name and return 200 for valid payload", async () => {
      const userRepository = createUserRepositoryMock();
      const tokenVerifier = createTokenVerifierMock();
      
      const mockUser = { sub: "u123", role: "BUYER" };
      tokenVerifier.verifyAccessToken.mockResolvedValueOnce(mockUser);
      userRepository.update.mockResolvedValueOnce({
        id: "u123",
        name: "New Name",
        phone: "+919999999999",
        isVerified: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const server = createServer({
        disableRedis: true,
        // @ts-expect-error - mock dependencies
        registerRoutes: (app) => registerUserRoutes(app, { userRepository, tokenVerifier })
      });
      servers.push(server);

      const response = await server.inject({
        method: "PUT",
        url: "/api/v1/account/profile",
        headers: {
          authorization: "Bearer valid-token"
        },
        payload: { name: "New Name" }
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.name).toBe("New Name");
      expect(userRepository.update).toHaveBeenCalledWith("u123", { name: "New Name" });
    });

    it("should return 401 when unauthenticated", async () => {
      const userRepository = createUserRepositoryMock();
      const tokenVerifier = createTokenVerifierMock();

      const server = createServer({
        disableRedis: true,
        // @ts-expect-error - mock dependencies
        registerRoutes: (app) => registerUserRoutes(app, { userRepository, tokenVerifier })
      });
      servers.push(server);

      const response = await server.inject({
        method: "PUT",
        url: "/api/v1/account/profile",
        payload: { name: "New Name" }
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 400 for invalid payload (empty name)", async () => {
      const userRepository = createUserRepositoryMock();
      const tokenVerifier = createTokenVerifierMock();
      
      tokenVerifier.verifyAccessToken.mockResolvedValueOnce({ sub: "u123", role: "BUYER" });

      const server = createServer({
        disableRedis: true,
        // @ts-expect-error - mock dependencies
        registerRoutes: (app) => registerUserRoutes(app, { userRepository, tokenVerifier })
      });
      servers.push(server);

      const response = await server.inject({
        method: "PUT",
        url: "/api/v1/account/profile",
        headers: {
          authorization: "Bearer valid-token"
        },
        payload: { name: "" }
      });

      expect(response.statusCode).toBe(400);
    });
  });
});

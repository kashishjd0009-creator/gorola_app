import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { AppError } from "@gorola/shared";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastify from "fastify";
import fp from "fastify-plugin";
import { v4 as uuidV4 } from "uuid";

import { getPrismaClient } from "./lib/prisma.js";
import { getRedisClient } from "./lib/redis.js";

const requestIdPlugin = fp(async (app: FastifyInstance): Promise<void> => {
  app.addHook("onRequest", async (request, reply) => {
    const requestId = request.headers["x-request-id"]?.toString() ?? uuidV4();
    request.headers["x-request-id"] = requestId;
    reply.header("x-request-id", requestId);
  });
});

type RouteRegistrar = (app: FastifyInstance) => void | Promise<void>;

export type CreateServerOptions = {
  registerRoutes?: RouteRegistrar;
  disableRedis?: boolean;
};

type SuccessEnvelope<T> = {
  success: true;
  data: T;
  meta: {
    requestId: string;
  };
};

type ErrorEnvelope = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
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

export function createServer(options: CreateServerOptions = {}): FastifyInstance {
  const app = fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info"
    }
  });

  const corsOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  void app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"]
      }
    }
  });
  void app.register(cors, {
    origin: corsOrigins.length === 0 ? true : corsOrigins
  });

  const redisClient =
    process.env.NODE_ENV === "test" || options.disableRedis ? null : getRedisClient();
  void app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: "1 minute",
    ...(redisClient
      ? {
          redis: redisClient
        }
      : {})
  });
  void app.register(cookie);
  app.addHook("preHandler", async (_request, reply) => {
    const originalSetCookie = reply.setCookie.bind(reply);
    reply.setCookie = ((name, value, options = {}) =>
      originalSetCookie(name, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        ...options
      })) as typeof reply.setCookie;
  });
  void app.register(requestIdPlugin);

  app.decorate("prisma", getPrismaClient());
  app.decorate("redis", redisClient);

  app.setErrorHandler((error, request, reply) => {
    const appError =
      error instanceof AppError
        ? error
        : new AppError("Internal server error", {
            code: "INTERNAL_SERVER_ERROR",
            statusCode: 500
          });
    const payload: ErrorEnvelope = {
      success: false,
      error: {
        code: appError.code,
        message: appError.message,
        ...(appError.details ? { details: appError.details as Record<string, unknown> } : {})
      },
      meta: {
        requestId: getRequestId(request, reply)
      }
    };

    void reply.status(appError.statusCode).send(payload);
  });

  app.get("/api/health", async (request, reply) =>
    success(request, reply, {
      status: "ok"
    })
  );

  if (options.registerRoutes) {
    void app.register(async (registeredApp) => options.registerRoutes?.(registeredApp));
  }

  return app;
}

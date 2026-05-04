import { ValidationError } from "@gorola/shared";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { getPrismaClient } from "../../lib/prisma.js";
import { SearchRepository } from "./search.repository.js";

type SuccessEnvelope<T> = {
  success: true;
  data: T;
  meta: {
    requestId: string;
  };
};

const searchQuerySchema = z.object({
  q: z.string().trim().min(1),
  limit: z.coerce.number().int().min(1).max(20).default(5)
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

export function registerSearchRoutes(app: FastifyInstance): void {
  const searchRepo = new SearchRepository(getPrismaClient());

  app.get("/api/v1/search", async (request, reply) => {
    const parsed = searchQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      throw new ValidationError("Invalid search query", parsed.error.flatten());
    }

    const data = await searchRepo.searchGlobally(parsed.data.q, parsed.data.limit);
    return success(request, reply, data);
  });
}

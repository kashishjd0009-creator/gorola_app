import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { getPrismaClient } from "../../lib/prisma.js";
import { SubCategoryRepository } from "./sub-category.repository.js";

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

export function registerSubCategoryRoutes(app: FastifyInstance): void {
  const subCategoryRepo = new SubCategoryRepository(getPrismaClient());

  app.get<{ Params: { slug: string } }>(
    "/api/v1/categories/:slug/sub-categories",
    async (request, reply) => {
      const { slug } = request.params;
      const subCategories = await subCategoryRepo.findAllByCategorySlug(slug);
      return success(request, reply, subCategories);
    }
  );
}

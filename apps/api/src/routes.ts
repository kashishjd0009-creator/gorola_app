import type { FastifyInstance } from "fastify";

import { registerCategoryRoutes } from "./modules/catalog/category.controller.js";

export function registerAppRoutes(app: FastifyInstance): void {
  registerCategoryRoutes(app);
}

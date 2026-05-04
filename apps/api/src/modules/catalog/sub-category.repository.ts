import { NotFoundError } from "@gorola/shared";
import type { PrismaClient, SubCategory } from "@prisma/client";

export class SubCategoryRepository {
  public constructor(private readonly db: PrismaClient) {}

  public async findAllByCategorySlug(
    categorySlug: string,
    options?: { includeInactive?: boolean }
  ): Promise<SubCategory[]> {
    const category = await this.db.category.findUnique({
      where: { slug: categorySlug }
    });

    if (!category) {
      throw new NotFoundError("Category not found", { slug: categorySlug });
    }

    return this.db.subCategory.findMany({
      where: {
        categoryId: category.id,
        ...(options?.includeInactive === true ? {} : { isActive: true })
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }]
    });
  }
}

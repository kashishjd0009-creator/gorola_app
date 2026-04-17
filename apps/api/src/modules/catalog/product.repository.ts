import { NotFoundError } from "@gorola/shared";
import type { PrismaClient, Product } from "@prisma/client";

export type CreateProductInput = {
  storeId: string;
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive?: boolean;
};

export type UpdateProductInput = Partial<
  Pick<Product, "name" | "description" | "imageUrl" | "categoryId" | "isActive" | "isDeleted">
>;

function isPrismaError(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === code
  );
}

export class ProductRepository {
  public constructor(private readonly db: PrismaClient) {}

  public async findById(
    id: string,
    options?: { includeDeleted?: boolean }
  ): Promise<Product | null> {
    return this.db.product.findFirst({
      where: {
        id,
        ...(options?.includeDeleted === true ? {} : { isDeleted: false })
      }
    });
  }

  public async findByStoreId(
    storeId: string,
    options?: { includeDeleted?: boolean; includeInactive?: boolean }
  ): Promise<Product[]> {
    return this.db.product.findMany({
      where: {
        storeId,
        ...(options?.includeDeleted === true ? {} : { isDeleted: false }),
        ...(options?.includeInactive === true ? {} : { isActive: true })
      },
      orderBy: { name: "asc" }
    });
  }

  public async create(input: CreateProductInput): Promise<Product> {
    try {
      return await this.db.product.create({
        data: {
          storeId: input.storeId,
          categoryId: input.categoryId,
          name: input.name,
          description: input.description,
          imageUrl: input.imageUrl,
          isActive: input.isActive ?? true
        }
      });
    } catch (error: unknown) {
      if (isPrismaError(error, "P2003")) {
        throw new NotFoundError(
          "Store or category not found",
          { storeId: input.storeId, categoryId: input.categoryId },
          error
        );
      }
      throw error;
    }
  }

  public async update(id: string, data: UpdateProductInput): Promise<Product> {
    try {
      return await this.db.product.update({
        where: { id },
        data
      });
    } catch (error: unknown) {
      if (isPrismaError(error, "P2025")) {
        throw new NotFoundError("Product not found", { id }, error);
      }
      if (isPrismaError(error, "P2003")) {
        throw new NotFoundError(
          "Category not found",
          { categoryId: data.categoryId },
          error
        );
      }
      throw error;
    }
  }
}

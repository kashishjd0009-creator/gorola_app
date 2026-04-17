import { NotFoundError } from "@gorola/shared";
import { Prisma, type PrismaClient, type ProductVariant } from "@prisma/client";

export type CreateProductVariantInput = {
  productId: string;
  label: string;
  price: string | number;
  stockQty?: number;
  unit: string;
  isActive?: boolean;
};

export type UpdateProductVariantInput = Partial<{
  label: string;
  price: string | number;
  stockQty: number;
  unit: string;
  isActive: boolean;
}>;

function isPrismaError(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === code
  );
}

function toDecimal(value: string | number): Prisma.Decimal {
  return new Prisma.Decimal(typeof value === "number" ? String(value) : value);
}

export class ProductVariantRepository {
  public constructor(private readonly db: PrismaClient) {}

  public async findById(
    id: string,
    options?: { includeInactive?: boolean }
  ): Promise<ProductVariant | null> {
    return this.db.productVariant.findFirst({
      where: {
        id,
        ...(options?.includeInactive === true ? {} : { isActive: true })
      }
    });
  }

  public async findByProductId(
    productId: string,
    options?: { includeInactive?: boolean }
  ): Promise<ProductVariant[]> {
    return this.db.productVariant.findMany({
      where: {
        productId,
        ...(options?.includeInactive === true ? {} : { isActive: true })
      },
      orderBy: { label: "asc" }
    });
  }

  public async create(input: CreateProductVariantInput): Promise<ProductVariant> {
    try {
      return await this.db.productVariant.create({
        data: {
          productId: input.productId,
          label: input.label,
          price: toDecimal(input.price),
          stockQty: input.stockQty ?? 0,
          unit: input.unit,
          isActive: input.isActive ?? true
        }
      });
    } catch (error: unknown) {
      if (isPrismaError(error, "P2003")) {
        throw new NotFoundError("Product not found", { productId: input.productId }, error);
      }
      throw error;
    }
  }

  public async update(id: string, data: UpdateProductVariantInput): Promise<ProductVariant> {
    try {
      const { price, ...rest } = data;
      return await this.db.productVariant.update({
        where: { id },
        data: {
          ...rest,
          ...(price !== undefined ? { price: toDecimal(price) } : {})
        }
      });
    } catch (error: unknown) {
      if (isPrismaError(error, "P2025")) {
        throw new NotFoundError("Product variant not found", { id }, error);
      }
      throw error;
    }
  }
}

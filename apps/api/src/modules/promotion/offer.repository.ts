import { NotFoundError } from "@gorola/shared";
import { type Offer, Prisma, type PrismaClient } from "@prisma/client";

export type CreateOfferInput = {
  storeId: string;
  title: string;
  description: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: string | number;
  minOrderAmount?: string | number | null;
  maxDiscount?: string | number | null;
  startsAt: Date;
  endsAt: Date;
};

function isPrismaError(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === code
  );
}

function toDecimal(value: string | number | null | undefined): Prisma.Decimal | null {
  if (value === undefined || value === null) {
    return null;
  }
  return new Prisma.Decimal(typeof value === "number" ? String(value) : value);
}

export class OfferRepository {
  public constructor(private readonly db: PrismaClient) {}

  public async findActive(now: Date = new Date()): Promise<Offer[]> {
    return this.db.offer.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gte: now }
      },
      orderBy: { startsAt: "desc" }
    });
  }

  public async create(input: CreateOfferInput): Promise<Offer> {
    try {
      return await this.db.offer.create({
        data: {
          storeId: input.storeId,
          title: input.title,
          description: input.description,
          discountType: input.discountType,
          discountValue: toDecimal(input.discountValue)!,
          minOrderAmount: toDecimal(input.minOrderAmount),
          maxDiscount: toDecimal(input.maxDiscount),
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          isActive: true
        }
      });
    } catch (error: unknown) {
      if (isPrismaError(error, "P2003")) {
        throw new NotFoundError("Store not found", { storeId: input.storeId }, error);
      }
      throw error;
    }
  }

  public async deactivate(id: string): Promise<Offer> {
    try {
      return await this.db.offer.update({
        where: { id },
        data: { isActive: false }
      });
    } catch (error: unknown) {
      if (isPrismaError(error, "P2025")) {
        throw new NotFoundError("Offer not found", { id }, error);
      }
      throw error;
    }
  }
}
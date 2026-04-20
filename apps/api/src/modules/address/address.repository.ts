import { NotFoundError } from "@gorola/shared";
import { type Address, Prisma, type PrismaClient } from "@prisma/client";

export type CreateAddressInput = {
  userId: string;
  label: string;
  landmarkDescription: string;
  flatRoom?: string | null;
  lat?: string | number | null;
  lng?: string | number | null;
  isDefault?: boolean;
};

export type UpdateAddressInput = Partial<{
  label: string;
  landmarkDescription: string;
  flatRoom: string | null;
  lat: string | number | null;
  lng: string | number | null;
  isDefault: boolean;
}>;

function isPrismaError(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === code
  );
}

function toDecimal(value: string | number | null): Prisma.Decimal | null {
  if (value === null) {
    return null;
  }
  return new Prisma.Decimal(typeof value === "number" ? String(value) : value);
}

export class AddressRepository {
  public constructor(private readonly db: PrismaClient) {}

  public async findAllByUserId(
    userId: string,
    options?: { includeDeleted?: boolean }
  ): Promise<Address[]> {
    return this.db.address.findMany({
      where: {
        userId,
        ...(options?.includeDeleted === true ? {} : { isDeleted: false })
      },
      orderBy: { createdAt: "asc" }
    });
  }

  public async findDefault(
    userId: string,
    options?: { includeDeleted?: boolean }
  ): Promise<Address | null> {
    return this.db.address.findFirst({
      where: {
        userId,
        isDefault: true,
        ...(options?.includeDeleted === true ? {} : { isDeleted: false })
      }
    });
  }

  public async create(input: CreateAddressInput): Promise<Address> {
    try {
      return await this.db.$transaction(async (tx) => {
        if (input.isDefault === true) {
          await tx.address.updateMany({
            where: { userId: input.userId, isDeleted: false, isDefault: true },
            data: { isDefault: false }
          });
        }

        return tx.address.create({
          data: {
            userId: input.userId,
            label: input.label,
            landmarkDescription: input.landmarkDescription,
            flatRoom: input.flatRoom ?? null,
            ...(input.lat !== undefined ? { lat: toDecimal(input.lat) } : {}),
            ...(input.lng !== undefined ? { lng: toDecimal(input.lng) } : {}),
            isDefault: input.isDefault ?? false
          }
        });
      });
    } catch (error: unknown) {
      if (isPrismaError(error, "P2003")) {
        throw new NotFoundError("User not found", { userId: input.userId }, error);
      }
      throw error;
    }
  }

  public async update(id: string, data: UpdateAddressInput): Promise<Address> {
    const existing = await this.db.address.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) {
      throw new NotFoundError("Address not found", { id });
    }

    return this.db.$transaction(async (tx) => {
      if (data.isDefault === true) {
        await tx.address.updateMany({
          where: { userId: existing.userId, isDeleted: false, isDefault: true, NOT: { id } },
          data: { isDefault: false }
        });
      }

      return tx.address.update({
        where: { id },
        data: {
          ...(data.label !== undefined ? { label: data.label } : {}),
          ...(data.landmarkDescription !== undefined
            ? { landmarkDescription: data.landmarkDescription }
            : {}),
          ...(data.flatRoom !== undefined ? { flatRoom: data.flatRoom } : {}),
          ...(data.lat !== undefined ? { lat: toDecimal(data.lat) } : {}),
          ...(data.lng !== undefined ? { lng: toDecimal(data.lng) } : {}),
          ...(data.isDefault !== undefined ? { isDefault: data.isDefault } : {})
        }
      });
    });
  }

  public async softDelete(id: string): Promise<Address> {
    const existing = await this.db.address.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) {
      throw new NotFoundError("Address not found", { id });
    }

    return this.db.address.update({
      where: { id },
      data: {
        isDeleted: true,
        isDefault: false
      }
    });
  }
}
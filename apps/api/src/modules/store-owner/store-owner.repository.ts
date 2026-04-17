import { ConflictError, NotFoundError } from "@gorola/shared";
import type { PrismaClient, StoreOwner } from "@prisma/client";

export type CreateStoreOwnerInput = {
  email: string;
  passwordHash: string;
  storeId: string;
  totpSecret?: string | null;
  totpEnabled?: boolean;
};

export type UpdateStoreOwnerInput = Partial<
  Pick<StoreOwner, "email" | "passwordHash" | "storeId" | "totpSecret" | "totpEnabled">
>;

function isPrismaError(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === code
  );
}

export class StoreOwnerRepository {
  public constructor(private readonly db: PrismaClient) {}

  public async findById(
    id: string,
    options?: { includeDeleted?: boolean }
  ): Promise<StoreOwner | null> {
    return this.db.storeOwner.findFirst({
      where: {
        id,
        ...(options?.includeDeleted === true ? {} : { isDeleted: false })
      }
    });
  }

  public async findByEmail(
    email: string,
    options?: { includeDeleted?: boolean }
  ): Promise<StoreOwner | null> {
    return this.db.storeOwner.findFirst({
      where: {
        email,
        ...(options?.includeDeleted === true ? {} : { isDeleted: false })
      }
    });
  }

  public async create(input: CreateStoreOwnerInput): Promise<StoreOwner> {
    try {
      return await this.db.storeOwner.create({
        data: {
          email: input.email,
          passwordHash: input.passwordHash,
          storeId: input.storeId,
          totpSecret: input.totpSecret ?? null,
          totpEnabled: input.totpEnabled ?? false
        }
      });
    } catch (error: unknown) {
      if (isPrismaError(error, "P2002")) {
        throw new ConflictError(
          "Store owner with this email already exists",
          { field: "email" },
          error
        );
      }
      if (isPrismaError(error, "P2003")) {
        throw new NotFoundError("Store not found", { storeId: input.storeId }, error);
      }
      throw error;
    }
  }

  public async update(id: string, data: UpdateStoreOwnerInput): Promise<StoreOwner> {
    try {
      return await this.db.storeOwner.update({
        where: { id },
        data
      });
    } catch (error: unknown) {
      if (isPrismaError(error, "P2025")) {
        throw new NotFoundError("Store owner not found", { id }, error);
      }
      if (isPrismaError(error, "P2002")) {
        throw new ConflictError(
          "Store owner with this email already exists",
          { field: "email" },
          error
        );
      }
      if (isPrismaError(error, "P2003")) {
        const storeId = data.storeId;
        throw new NotFoundError("Store not found", { storeId }, error);
      }
      throw error;
    }
  }
}

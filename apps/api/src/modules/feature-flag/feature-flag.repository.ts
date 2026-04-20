import { NotFoundError } from "@gorola/shared";
import type { FeatureFlag, PrismaClient } from "@prisma/client";

function isPrismaError(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === code
  );
}

export class FeatureFlagRepository {
  public constructor(private readonly db: PrismaClient) {}

  public async getAll(): Promise<FeatureFlag[]> {
    return this.db.featureFlag.findMany({ orderBy: { key: "asc" } });
  }

  public async getByKey(key: string): Promise<FeatureFlag | null> {
    return this.db.featureFlag.findUnique({ where: { key } });
  }

  public async update(
    key: string,
    data: { value: boolean; updatedBy: string; description?: string | null }
  ): Promise<FeatureFlag> {
    try {
      return await this.db.featureFlag.update({
        where: { key },
        data: {
          value: data.value,
          updatedBy: data.updatedBy,
          ...(data.description !== undefined ? { description: data.description } : {})
        }
      });
    } catch (error: unknown) {
      if (isPrismaError(error, "P2025")) {
        throw new NotFoundError("Feature flag not found", { key }, error);
      }
      throw error;
    }
  }
}
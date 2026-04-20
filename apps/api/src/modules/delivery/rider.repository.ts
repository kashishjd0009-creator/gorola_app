import { NotImplementedError } from "@gorola/shared";
import type { DeliveryRider, PrismaClient, RiderLocation } from "@prisma/client";

/**
 * Phase 1.3 stub repository for deferred rider interface.
 */
export class RiderRepository {
  public constructor(private readonly db: PrismaClient) {}

  public async create(input: {
    name: string;
    phone: string;
    storeId: string;
  }): Promise<DeliveryRider> {
    void this.db;
    void input;
    throw new NotImplementedError("Rider interface is deferred to Phase 5");
  }

  public async getActiveByStore(storeId: string): Promise<DeliveryRider[]> {
    void this.db;
    void storeId;
    throw new NotImplementedError("Rider interface is deferred to Phase 5");
  }

  public async updateLocation(
    riderId: string,
    input: { lat: string | number; lng: string | number }
  ): Promise<RiderLocation> {
    void this.db;
    void riderId;
    void input;
    throw new NotImplementedError("Rider interface is deferred to Phase 5");
  }
}
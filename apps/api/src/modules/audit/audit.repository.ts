import type { ActorRole, AuditLog, Prisma, PrismaClient } from "@prisma/client";

export type CreateAuditLogInput = {
  actorId: string;
  actorRole: ActorRole;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: Prisma.InputJsonValue;
  newValue?: Prisma.InputJsonValue;
  ip: string;
  userAgent: string;
};

export class AuditRepository {
  public constructor(private readonly db: PrismaClient) {}

  public async create(input: CreateAuditLogInput): Promise<AuditLog> {
    return this.db.auditLog.create({
      data: {
        actorId: input.actorId,
        actorRole: input.actorRole,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        ...(input.oldValue !== undefined ? { oldValue: input.oldValue } : {}),
        ...(input.newValue !== undefined ? { newValue: input.newValue } : {}),
        ip: input.ip,
        userAgent: input.userAgent
      }
    });
  }
}
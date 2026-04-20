import { NotFoundError, ValidationError } from "@gorola/shared";
import {
  type Order,
  type OrderItem,
  type OrderStatus,
  type OrderStatusHistory,
  type PaymentMethod,
  Prisma,
  type PrismaClient
} from "@prisma/client";

export type OrderWithRelations = Order & {
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
};

export type CreateOrderInput = {
  userId: string;
  storeId: string;
  subtotal: string | number;
  deliveryFee: string | number;
  total: string | number;
  paymentMethod: PaymentMethod;
  landmarkDescription: string;
  deliveryNote?: string | null;
  scheduledFor?: Date | null;
  items: Array<{
    productVariantId: string;
    productName: string;
    variantLabel: string;
    price: string | number;
    quantity: number;
  }>;
  changedBy: string;
};

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

async function getOrderWithRelations(db: PrismaClient, id: string): Promise<OrderWithRelations> {
  return db.order.findUniqueOrThrow({
    where: { id },
    include: {
      items: { orderBy: { id: "asc" } },
      statusHistory: { orderBy: { changedAt: "asc" } }
    }
  });
}

export class OrderRepository {
  public constructor(private readonly db: PrismaClient) {}

  public async create(input: CreateOrderInput): Promise<OrderWithRelations> {
    if (input.items.length === 0) {
      throw new ValidationError("Order must contain at least one item");
    }

    try {
      const order = await this.db.order.create({
        data: {
          userId: input.userId,
          storeId: input.storeId,
          subtotal: toDecimal(input.subtotal),
          deliveryFee: toDecimal(input.deliveryFee),
          total: toDecimal(input.total),
          paymentMethod: input.paymentMethod,
          landmarkDescription: input.landmarkDescription,
          deliveryNote: input.deliveryNote ?? null,
          scheduledFor: input.scheduledFor ?? null,
          items: {
            create: input.items.map((item) => ({
              productVariantId: item.productVariantId,
              productName: item.productName,
              variantLabel: item.variantLabel,
              price: toDecimal(item.price),
              quantity: item.quantity
            }))
          },
          statusHistory: {
            create: {
              status: "PLACED",
              note: null,
              changedBy: input.changedBy
            }
          }
        }
      });

      return getOrderWithRelations(this.db, order.id);
    } catch (error: unknown) {
      if (isPrismaError(error, "P2003")) {
        throw new NotFoundError(
          "User, store, or product variant not found",
          {
            userId: input.userId,
            storeId: input.storeId
          },
          error
        );
      }
      throw error;
    }
  }

  public async findById(id: string): Promise<OrderWithRelations | null> {
    return this.db.order.findUnique({
      where: { id },
      include: {
        items: { orderBy: { id: "asc" } },
        statusHistory: { orderBy: { changedAt: "asc" } }
      }
    });
  }

  public async findByUserId(userId: string): Promise<OrderWithRelations[]> {
    return this.db.order.findMany({
      where: { userId },
      include: {
        items: { orderBy: { id: "asc" } },
        statusHistory: { orderBy: { changedAt: "asc" } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  public async findByStoreId(storeId: string): Promise<OrderWithRelations[]> {
    return this.db.order.findMany({
      where: { storeId },
      include: {
        items: { orderBy: { id: "asc" } },
        statusHistory: { orderBy: { changedAt: "asc" } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  public async updateStatus(
    orderId: string,
    status: OrderStatus,
    changedBy: string,
    note?: string
  ): Promise<OrderWithRelations> {
    try {
      await this.db.$transaction([
        this.db.order.update({
          where: { id: orderId },
          data: { status }
        }),
        this.db.orderStatusHistory.create({
          data: {
            orderId,
            status,
            note: note ?? null,
            changedBy
          }
        })
      ]);

      return getOrderWithRelations(this.db, orderId);
    } catch (error: unknown) {
      if (isPrismaError(error, "P2025") || isPrismaError(error, "P2003")) {
        throw new NotFoundError("Order not found", { orderId }, error);
      }
      throw error;
    }
  }

  public async addStatusHistory(
    orderId: string,
    status: OrderStatus,
    changedBy: string,
    note?: string
  ): Promise<OrderStatusHistory> {
    try {
      return await this.db.orderStatusHistory.create({
        data: {
          orderId,
          status,
          note: note ?? null,
          changedBy
        }
      });
    } catch (error: unknown) {
      if (isPrismaError(error, "P2003")) {
        throw new NotFoundError("Order not found", { orderId }, error);
      }
      throw error;
    }
  }
}
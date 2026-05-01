import { UnprocessableEntityError, ValidationError } from "@gorola/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CreateOrderInput, OrderWithRelations } from "../../../modules/order/order.repository.js";
import { OrderService } from "../../../modules/order/order.service.js";

const mockProductVariant = {
  findUnique: vi.fn(),
  findMany: vi.fn()
};

const mockTx = { productVariant: mockProductVariant } as never;

type OrderRepoM = {
  create: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
  updateStatus: ReturnType<typeof vi.fn>;
};
type VariantRepoM = { decrementStock: ReturnType<typeof vi.fn> };
type StockM = { create: ReturnType<typeof vi.fn> };

const baseInput = (): CreateOrderInput => ({
  userId: "u1",
  storeId: "s1",
  subtotal: "10.00",
  deliveryFee: "0",
  total: "10.00",
  paymentMethod: "COD",
  landmarkDescription: "Near the old oak tree",
  items: [
    {
      productVariantId: "v1",
      productName: "P",
      variantLabel: "1",
      price: "10.00",
      quantity: 1
    }
  ],
  changedBy: "buyer:unit"
});

const sampleOrder = (): OrderWithRelations =>
  ({
    id: "ord1",
    userId: "u1",
    storeId: "s1",
    status: "PLACED",
    subtotal: {} as never,
    deliveryFee: {} as never,
    total: {} as never,
    paymentMethod: "COD",
    landmarkDescription: "x",
    deliveryNote: null,
    scheduledFor: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: "oi1",
        orderId: "ord1",
        productVariantId: "v1",
        productName: "P",
        variantLabel: "1",
        price: {} as never,
        quantity: 1
      }
    ],
    statusHistory: [],
    store: { id: "s1", name: "Mock Store", phone: "+919900000001" }
  }) as never;

function mockVariantForPreCheck(available: number, storeId = "s1"): void {
  mockProductVariant.findMany.mockImplementation(async (args: { where: { id: { in: string[] } } }) => {
    const ids = args.where.id.in;
    return ids.map(id => ({ id, stockQty: available, product: { storeId } }));
  });
}

describe("OrderService (unit)", () => {
  const orders: OrderRepoM = {
    create: vi.fn(),
    findById: vi.fn(),
    updateStatus: vi.fn()
  };
  const variants: VariantRepoM = { decrementStock: vi.fn() };
  const stockMovements: StockM = { create: vi.fn() };
  const db: { $transaction: ReturnType<typeof vi.fn> } = { $transaction: vi.fn() };

  let service: OrderService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockProductVariant.findUnique.mockReset();
    db.$transaction.mockImplementation(
      (fn: (t: never) => Promise<unknown>) => fn(mockTx)
    );
    service = new OrderService(
      db as never,
      orders as never,
      variants as never,
      stockMovements as never
    );
  });

  describe("placeOrderWithStock", () => {
    it("should deduct stock, record SALE, and return order directly from transaction", async () => {
      mockVariantForPreCheck(10, "s1");
      const order = sampleOrder();
      orders.create.mockResolvedValueOnce(order);
      variants.decrementStock.mockResolvedValue({ stockQtyBefore: 2, stockQtyAfter: 1 });
      stockMovements.create.mockResolvedValue({ id: "m1" });

      const result = await service.placeOrderWithStock(baseInput());
      expect(orders.create).toHaveBeenCalledWith(baseInput(), mockTx);
      expect(variants.decrementStock).toHaveBeenCalledWith(
        "v1",
        1,
        "s1",
        mockTx,
        expect.objectContaining({ beforeRow: expect.any(Object) })
      );
      expect(stockMovements.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "SALE",
          productVariantId: "v1",
          orderId: "ord1"
        }),
        mockTx
      );
      expect(orders.findById).not.toHaveBeenCalled();
      expect(result.id).toBe("ord1");
    });

    it("should not call decrement or stock when order create throws after pre-check", async () => {
      mockVariantForPreCheck(5, "s1");
      orders.create.mockRejectedValueOnce(new ValidationError("fail"));

      await expect(service.placeOrderWithStock(baseInput())).rejects.toBeInstanceOf(ValidationError);
      expect(variants.decrementStock).not.toHaveBeenCalled();
      expect(stockMovements.create).not.toHaveBeenCalled();
    });

    it("should not record stock when decrement fails after create", async () => {
      mockVariantForPreCheck(5, "s1");
      orders.create.mockResolvedValueOnce(sampleOrder());
      variants.decrementStock.mockRejectedValueOnce(
        new UnprocessableEntityError("not enough", { a: 1 })
      );
      await expect(service.placeOrderWithStock(baseInput())).rejects.toBeInstanceOf(
        UnprocessableEntityError
      );
      expect(stockMovements.create).not.toHaveBeenCalled();
    });
  });
});

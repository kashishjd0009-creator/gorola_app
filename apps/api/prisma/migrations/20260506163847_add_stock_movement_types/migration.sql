-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StockMovementType" ADD VALUE 'REFILL';
ALTER TYPE "StockMovementType" ADD VALUE 'ADJUSTMENT';
ALTER TYPE "StockMovementType" ADD VALUE 'INITIAL';

-- AlterTable
ALTER TABLE "StockMovement" ALTER COLUMN "orderId" DROP NOT NULL;

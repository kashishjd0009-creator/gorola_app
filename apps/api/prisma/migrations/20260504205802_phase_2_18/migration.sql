/*
  Warnings:

  - You are about to drop the column `emoji` on the `Category` table. All the data in the column will be lost.
  - Made the column `subCategoryId` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_subCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "SubCategory" DROP CONSTRAINT "SubCategory_categoryId_fkey";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "emoji",
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "subCategoryId" SET NOT NULL;

-- AlterTable
ALTER TABLE "SubCategory" ADD COLUMN     "imageUrl" TEXT;

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

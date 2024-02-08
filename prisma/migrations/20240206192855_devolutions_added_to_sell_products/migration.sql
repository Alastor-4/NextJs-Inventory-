/*
  Warnings:

  - You are about to drop the column `returned_at` on the `sells` table. All the data in the column will be lost.
  - You are about to drop the column `returned_reason` on the `sells` table. All the data in the column will be lost.
  - You are about to drop the column `units_returned_quantity` on the `sells` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sell_products" ADD COLUMN     "returned_at" TIMESTAMP(0),
ADD COLUMN     "returned_reason" TEXT,
ADD COLUMN     "units_returned_quantity" INTEGER;

-- AlterTable
ALTER TABLE "sells" DROP COLUMN "returned_at",
DROP COLUMN "returned_reason",
DROP COLUMN "units_returned_quantity";

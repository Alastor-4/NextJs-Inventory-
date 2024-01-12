/*
  Warnings:

  - You are about to drop the column `description` on the `store_depots` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "store_depots" DROP COLUMN "description",
ADD COLUMN     "discount_description" TEXT;

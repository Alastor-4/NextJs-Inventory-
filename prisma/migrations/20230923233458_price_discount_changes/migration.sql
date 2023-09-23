/*
  Warnings:

  - You are about to drop the column `price_discount` on the `store_depots` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `store_depots` DROP COLUMN `price_discount`,
    ADD COLUMN `price_discount_percentage` FLOAT NULL,
    ADD COLUMN `price_discount_quantity` FLOAT NULL;

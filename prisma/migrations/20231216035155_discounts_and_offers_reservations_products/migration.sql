/*
  Warnings:

  - You are about to drop the column `applied_discount` on the `reservations` table. All the data in the column will be lost.
  - You are about to drop the column `applied_offer` on the `reservations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `reservation_products` ADD COLUMN `applied_discount` JSON NULL,
    ADD COLUMN `applied_offer` JSON NULL;

-- AlterTable
ALTER TABLE `reservations` DROP COLUMN `applied_discount`,
    DROP COLUMN `applied_offer`;

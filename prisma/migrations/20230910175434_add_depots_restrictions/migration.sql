/*
  Warnings:

  - A unique constraint covering the columns `[product_id,warehouse_id]` on the table `depots` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[store_id,depot_id]` on the table `store_depots` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `store_depots` ADD COLUMN `is_active` BOOLEAN NULL DEFAULT true,
    ADD COLUMN `offer_notes` VARCHAR(255) NULL,
    ADD COLUMN `price_discount` VARCHAR(255) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `depots_product_id_warehouse_id_key` ON `depots`(`product_id`, `warehouse_id`);

-- CreateIndex
CREATE UNIQUE INDEX `store_depots_store_id_depot_id_key` ON `store_depots`(`store_id`, `depot_id`);

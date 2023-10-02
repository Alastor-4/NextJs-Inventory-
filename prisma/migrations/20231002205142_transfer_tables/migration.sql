/*
  Warnings:

  - You are about to drop the column `units_returned_at` on the `products_sell` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `products_sell` DROP COLUMN `units_returned_at`,
    ADD COLUMN `returned_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `returned_reason` TEXT NULL;

-- CreateTable
CREATE TABLE `product_store_transfers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_depot_id` INTEGER NULL,
    `units_transferred_quantity` INTEGER NULL,
    `from_store_accepted` BOOLEAN NULL DEFAULT false,
    `to_store_id` INTEGER NULL,
    `to_store_accepted` BOOLEAN NULL DEFAULT false,
    `transfer_notes` TEXT NULL,
    `transfer_cancelled` BOOLEAN NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `store_depot_transfers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_depot_id` INTEGER NULL,
    `units_transferred_quantity` INTEGER NULL,
    `transfer_direction` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product_store_transfers` ADD CONSTRAINT `product_store_transfers_store_depot_id_fkey` FOREIGN KEY (`store_depot_id`) REFERENCES `store_depots`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_store_transfers` ADD CONSTRAINT `product_store_transfers_to_store_id_fkey` FOREIGN KEY (`to_store_id`) REFERENCES `stores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

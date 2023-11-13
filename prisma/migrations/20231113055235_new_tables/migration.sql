/*
  Warnings:

  - You are about to drop the `products_reservation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products_sell` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `products_reservation` DROP FOREIGN KEY `products_reservation_FK`;

-- DropForeignKey
ALTER TABLE `products_reservation` DROP FOREIGN KEY `products_reservation_depot_FK`;

-- DropForeignKey
ALTER TABLE `products_reservation` DROP FOREIGN KEY `products_reservation_user_FK`;

-- DropForeignKey
ALTER TABLE `products_sell` DROP FOREIGN KEY `products_sell_FK`;

-- DropForeignKey
ALTER TABLE `products_sell` DROP FOREIGN KEY `products_sell_ibfk_1`;

-- DropForeignKey
ALTER TABLE `reservation_messages` DROP FOREIGN KEY `reservation_messages_FK`;

-- DropTable
DROP TABLE `products_reservation`;

-- DropTable
DROP TABLE `products_sell`;

-- CreateTable
CREATE TABLE `payment_methods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_units` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_offers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `compare_units_quantity` INTEGER NOT NULL,
    `compare_function` VARCHAR(100) NOT NULL,
    `price_per_unit` DOUBLE NOT NULL,
    `store_depot_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `NewTable_FK`(`store_depot_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservation_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reservation_id` INTEGER NOT NULL,
    `store_depot_id` INTEGER NOT NULL,
    `units_quantity` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `reservation_products_FK`(`reservation_id`),
    INDEX `reservation_products_FK_1`(`store_depot_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payment_method` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `requesting_user_id` INTEGER NOT NULL,
    `request_delivery` BOOLEAN NOT NULL DEFAULT false,
    `delivery_notes` TEXT NULL,
    `status_description` TEXT NULL,
    `status_id` INTEGER NOT NULL,
    `total_price` DOUBLE NOT NULL,

    INDEX `products_reservation_FK`(`status_id`),
    INDEX `products_reservation_user_FK`(`requesting_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sell_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sell_id` INTEGER NOT NULL,
    `store_depot_id` INTEGER NOT NULL,
    `units_quantity` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `reservation_products_FK`(`sell_id`),
    INDEX `reservation_products_FK_1`(`store_depot_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sells` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `total_price` DOUBLE NULL,
    `payment_method` VARCHAR(255) NULL,
    `units_returned_quantity` INTEGER NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `returned_at` TIMESTAMP(0) NULL,
    `returned_reason` TEXT NULL,
    `from_reservation_id` INTEGER NULL,
    `requesting_user_id` INTEGER NULL,

    INDEX `products_sell_FK`(`from_reservation_id`),
    INDEX `sells_FK`(`requesting_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reservation_messages` ADD CONSTRAINT `reservation_messages_FK` FOREIGN KEY (`product_reservation_id`) REFERENCES `reservations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `product_offers` ADD CONSTRAINT `NewTable_FK` FOREIGN KEY (`store_depot_id`) REFERENCES `store_depots`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `reservation_products` ADD CONSTRAINT `reservation_products_FK` FOREIGN KEY (`reservation_id`) REFERENCES `reservations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `reservation_products` ADD CONSTRAINT `reservation_products_FK_1` FOREIGN KEY (`store_depot_id`) REFERENCES `store_depots`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `products_reservation_FK` FOREIGN KEY (`status_id`) REFERENCES `reservation_status`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `products_reservation_user_FK` FOREIGN KEY (`requesting_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sell_products` ADD CONSTRAINT `sell_products_FK` FOREIGN KEY (`sell_id`) REFERENCES `sells`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sell_products` ADD CONSTRAINT `sell_products_FK_1` FOREIGN KEY (`store_depot_id`) REFERENCES `store_depots`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sells` ADD CONSTRAINT `products_sell_FK` FOREIGN KEY (`from_reservation_id`) REFERENCES `reservations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sells` ADD CONSTRAINT `sells_FK` FOREIGN KEY (`requesting_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

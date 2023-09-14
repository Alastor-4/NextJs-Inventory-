/*
  Warnings:

  - You are about to drop the `sell_price_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `sell_price_history` DROP FOREIGN KEY `sell_price_history_ibfk_1`;

-- AlterTable
ALTER TABLE `store_depots` ADD COLUMN `sell_price` DECIMAL(10, 2) NULL DEFAULT 0,
    ADD COLUMN `sell_price_unit` VARCHAR(100) NULL DEFAULT 'CUP',
    MODIFY `is_active` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `stores` ADD COLUMN `auto_open_time` BOOLEAN NULL DEFAULT true,
    ADD COLUMN `auto_reservation_time` BOOLEAN NULL DEFAULT true,
    ADD COLUMN `fixed_seller_profit_percentage` FLOAT NULL DEFAULT 5,
    ADD COLUMN `online_catalog` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `online_reservation` BOOLEAN NULL DEFAULT false;

-- DropTable
DROP TABLE `sell_price_history`;

-- CreateTable
CREATE TABLE `store_open_days` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `week_day_number` TINYINT NOT NULL,
    `day_start_time` TIME(0) NOT NULL,
    `day_end_time` TIME(0) NOT NULL,
    `store_id` INTEGER NOT NULL,

    INDEX `store_open_days_FK`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `store_reservation_days` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `week_day_number` TINYINT NOT NULL,
    `day_start_time` TIME(0) NOT NULL,
    `day_end_time` TIME(0) NOT NULL,
    `store_id` INTEGER NOT NULL,

    INDEX `store_reservation_days_FK`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `store_open_days` ADD CONSTRAINT `store_open_days_FK` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `store_reservation_days` ADD CONSTRAINT `store_reservation_days_FK` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

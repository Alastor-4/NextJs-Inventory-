/*
  Warnings:

  - You are about to drop the `store_colection_depots` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `store_colections` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `store_colection_depots` DROP FOREIGN KEY `store_colection_depot_FK`;

-- DropForeignKey
ALTER TABLE `store_colection_depots` DROP FOREIGN KEY `store_colection_depot_FK_1`;

-- DropForeignKey
ALTER TABLE `store_colections` DROP FOREIGN KEY `store_colections_FK`;

-- DropTable
DROP TABLE `store_colection_depots`;

-- DropTable
DROP TABLE `store_colections`;

-- CreateTable
CREATE TABLE `store_collection_depots` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_collection_id` INTEGER NOT NULL,
    `store_depot_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `store_collection_depot_FK`(`store_collection_id`),
    INDEX `store_collection_depot_FK_1`(`store_depot_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `store_collections` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_active` BOOLEAN NULL DEFAULT false,

    INDEX `store_collections_FK`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `store_collection_depots` ADD CONSTRAINT `store_collection_depot_FK` FOREIGN KEY (`store_collection_id`) REFERENCES `store_collections`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `store_collection_depots` ADD CONSTRAINT `store_collection_depot_FK_1` FOREIGN KEY (`store_depot_id`) REFERENCES `store_depots`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `store_collections` ADD CONSTRAINT `store_collections_FK` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

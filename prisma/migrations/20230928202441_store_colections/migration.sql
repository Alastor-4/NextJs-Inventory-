-- CreateTable
CREATE TABLE `store_colection_depots` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_colection_id` INTEGER NOT NULL,
    `store_depot_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `store_colection_depot_FK`(`store_colection_id`),
    INDEX `store_colection_depot_FK_1`(`store_depot_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `store_colections` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_active` BOOLEAN NULL DEFAULT false,

    INDEX `store_colections_FK`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `store_colection_depots` ADD CONSTRAINT `store_colection_depot_FK` FOREIGN KEY (`store_colection_id`) REFERENCES `store_colections`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `store_colection_depots` ADD CONSTRAINT `store_colection_depot_FK_1` FOREIGN KEY (`store_depot_id`) REFERENCES `store_depots`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `store_colections` ADD CONSTRAINT `store_colections_FK` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

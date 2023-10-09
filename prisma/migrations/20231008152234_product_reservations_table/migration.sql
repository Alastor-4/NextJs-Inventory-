-- AlterTable
ALTER TABLE `products_sell` ADD COLUMN `from_reservation_id` INTEGER NULL,
    MODIFY `returned_at` TIMESTAMP(0) NULL;

-- CreateTable
CREATE TABLE `products_reservation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_depot_id` INTEGER NOT NULL,
    `units_quantity` INTEGER NOT NULL,
    `payment_method` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `requesting_user_id` INTEGER NOT NULL,
    `status` VARCHAR(100) NOT NULL,
    `request_delivery` BOOLEAN NOT NULL DEFAULT false,
    `delivery_notes` TEXT NULL,

    INDEX `products_reservation_user_FK`(`requesting_user_id`),
    INDEX `store_depot_id`(`store_depot_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `products_sell_FK` ON `products_sell`(`from_reservation_id`);

-- AddForeignKey
ALTER TABLE `products_sell` ADD CONSTRAINT `products_sell_FK` FOREIGN KEY (`from_reservation_id`) REFERENCES `products_reservation`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `products_reservation` ADD CONSTRAINT `products_reservation_depot_FK` FOREIGN KEY (`store_depot_id`) REFERENCES `store_depots`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `products_reservation` ADD CONSTRAINT `products_reservation_user_FK` FOREIGN KEY (`requesting_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- CreateTable
CREATE TABLE `reservation_messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sender` VARCHAR(100) NOT NULL,
    `message` TEXT NOT NULL,
    `was_read` BOOLEAN NULL DEFAULT false,
    `product_reservation_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `reservation_messages_FK`(`product_reservation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reservation_messages` ADD CONSTRAINT `reservation_messages_FK` FOREIGN KEY (`product_reservation_id`) REFERENCES `products_reservation`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

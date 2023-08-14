/*
  Warnings:

  - You are about to drop the `charateristics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `charateristics` DROP FOREIGN KEY `charateristics_ibfk_1`;

-- DropTable
DROP TABLE `charateristics`;

-- CreateTable
CREATE TABLE `characteristics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NULL,
    `name` VARCHAR(255) NULL,
    `value` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `product_id`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `characteristics` ADD CONSTRAINT `characteristics_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

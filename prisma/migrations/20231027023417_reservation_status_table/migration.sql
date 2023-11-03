/*
  Warnings:

  - You are about to drop the column `status` on the `products_reservation` table. All the data in the column will be lost.
  - Added the required column `status_id` to the `products_reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `products_reservation` DROP COLUMN `status`,
    ADD COLUMN `status_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `reservation_status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` TINYINT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `products_reservation_FK` ON `products_reservation`(`status_id`);

-- AddForeignKey
ALTER TABLE `products_reservation` ADD CONSTRAINT `products_reservation_FK` FOREIGN KEY (`status_id`) REFERENCES `reservation_status`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

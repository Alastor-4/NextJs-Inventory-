-- DropForeignKey
ALTER TABLE `depots` DROP FOREIGN KEY `depots_ibfk_2`;

-- CreateIndex
CREATE INDEX `product_id` ON `depots`(`product_id`);

-- AddForeignKey
ALTER TABLE `depots` ADD CONSTRAINT `depots_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

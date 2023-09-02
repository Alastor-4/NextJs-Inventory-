-- CreateIndex
CREATE INDEX `stores_FK` ON `stores`(`seller_user_id`);

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `stores_FK` FOREIGN KEY (`seller_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

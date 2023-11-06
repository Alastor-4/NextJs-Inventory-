-- AlterTable
ALTER TABLE `store_depots` ADD COLUMN `seller_profit_unit` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `stores` ADD COLUMN `fixed_seller_profit_unit` VARCHAR(255) NULL;

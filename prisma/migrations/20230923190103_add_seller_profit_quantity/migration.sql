-- AlterTable
ALTER TABLE `store_depots` ADD COLUMN `seller_profit_quantity` FLOAT NULL;

-- AlterTable
ALTER TABLE `stores` ADD COLUMN `fixed_seller_profit_quantity` FLOAT NULL,
    ALTER COLUMN `fixed_seller_profit_percentage` DROP DEFAULT;

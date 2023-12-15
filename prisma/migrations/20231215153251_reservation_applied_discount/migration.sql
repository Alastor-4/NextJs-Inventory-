-- AlterTable
ALTER TABLE `reservations` ADD COLUMN `applied_discount` JSON NULL,
    ADD COLUMN `applied_offer` JSON NULL;

-- AddForeignKey
ALTER TABLE `store_depot_transfers` ADD CONSTRAINT `store_depot_transfers_store_depot_id_fkey` FOREIGN KEY (`store_depot_id`) REFERENCES `store_depots`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

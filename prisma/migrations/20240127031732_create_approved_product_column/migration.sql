/*
  Warnings:

  - You are about to drop the column `inserted_by_id` on the `depots` table. All the data in the column will be lost.
  - Added the required column `created_by_id` to the `store_depot_transfers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "depots" DROP COLUMN "inserted_by_id";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "is_approved" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "store_depot_transfers" ADD COLUMN     "created_by_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "store_depot_transfers" ADD CONSTRAINT "store_depot_transfer_user_FK" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

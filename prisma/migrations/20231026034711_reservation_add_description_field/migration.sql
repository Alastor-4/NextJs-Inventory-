/*
  Warnings:

  - Added the required column `status_description` to the `products_reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `products_reservation` ADD COLUMN `status_description` TEXT NOT NULL;

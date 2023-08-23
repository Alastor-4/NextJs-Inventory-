/*
  Warnings:

  - You are about to drop the column `name` on the `images` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `images` DROP COLUMN `name`,
    ADD COLUMN `fileKey` VARCHAR(255) NULL,
    ADD COLUMN `fileUrl` VARCHAR(255) NULL;

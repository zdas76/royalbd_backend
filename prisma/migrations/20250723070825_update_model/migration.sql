/*
  Warnings:

  - You are about to drop the column `jurnaStatus` on the `inventories` table. All the data in the column will be lost.
  - Added the required column `unitPrice` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `inventories` DROP COLUMN `jurnaStatus`,
    ADD COLUMN `status` ENUM('ACTIVE', 'DELETED', 'PUSH', 'BLOCK', 'PENDING', 'CHECKED', 'CLOSED', 'CONVERTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `products` ADD COLUMN `unitPrice` DOUBLE NOT NULL;

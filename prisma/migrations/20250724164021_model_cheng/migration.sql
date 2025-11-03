/*
  Warnings:

  - You are about to drop the column `logToRawId` on the `log_order_by_category` table. All the data in the column will be lost.
  - Added the required column `logCategoryId` to the `log_to_raw` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `log_order_by_category` DROP FOREIGN KEY `log_order_by_category_logToRawId_fkey`;

-- DropIndex
DROP INDEX `log_order_by_category_logToRawId_fkey` ON `log_order_by_category`;

-- AlterTable
ALTER TABLE `log_order_by_category` DROP COLUMN `logToRawId`;

-- AlterTable
ALTER TABLE `log_to_raw` ADD COLUMN `logCategoryId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `log_to_raw` ADD CONSTRAINT `log_to_raw_logCategoryId_fkey` FOREIGN KEY (`logCategoryId`) REFERENCES `log_order_by_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

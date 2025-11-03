/*
  Warnings:

  - You are about to drop the column `logOrderId` on the `journals` table. All the data in the column will be lost.
  - You are about to drop the column `logOrderId` on the `log_Order_Items` table. All the data in the column will be lost.
  - You are about to drop the column `logOrderId` on the `log_order_by_category` table. All the data in the column will be lost.
  - You are about to drop the `log_orders` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `transectionId` to the `log_Order_Items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `journals` DROP FOREIGN KEY `journals_logOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `log_Order_Items` DROP FOREIGN KEY `log_Order_Items_logOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `log_order_by_category` DROP FOREIGN KEY `log_order_by_category_logOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `log_orders` DROP FOREIGN KEY `log_orders_supplierId_fkey`;

-- DropIndex
DROP INDEX `journals_logOrderId_fkey` ON `journals`;

-- DropIndex
DROP INDEX `log_Order_Items_logOrderId_fkey` ON `log_Order_Items`;

-- DropIndex
DROP INDEX `log_order_by_category_logOrderId_fkey` ON `log_order_by_category`;

-- AlterTable
ALTER TABLE `journals` DROP COLUMN `logOrderId`;

-- AlterTable
ALTER TABLE `log_Order_Items` DROP COLUMN `logOrderId`,
    ADD COLUMN `transectionId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `log_order_by_category` DROP COLUMN `logOrderId`,
    ADD COLUMN `transectionId` INTEGER NULL;

-- DropTable
DROP TABLE `log_orders`;

-- AddForeignKey
ALTER TABLE `log_Order_Items` ADD CONSTRAINT `log_Order_Items_transectionId_fkey` FOREIGN KEY (`transectionId`) REFERENCES `transaction_info`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log_order_by_category` ADD CONSTRAINT `log_order_by_category_transectionId_fkey` FOREIGN KEY (`transectionId`) REFERENCES `transaction_info`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

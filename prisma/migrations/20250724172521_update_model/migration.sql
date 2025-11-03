/*
  Warnings:

  - You are about to drop the `createProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `createProduct` DROP FOREIGN KEY `createProduct_inventoryId_fkey`;

-- AlterTable
ALTER TABLE `transaction_info` MODIFY `voucherType` ENUM('SALES', 'PURCHASE', 'RECEIPT', 'PAYMENT', 'JOURNAL', 'CONTRA', 'LOGORADES', 'CREATEPRODUCT') NOT NULL;

-- DropTable
DROP TABLE `createProduct`;

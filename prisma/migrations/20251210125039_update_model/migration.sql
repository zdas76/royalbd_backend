/*
  Warnings:

  - You are about to drop the column `customerId` on the `transaction_info` table. All the data in the column will be lost.
  - You are about to drop the column `partyId` on the `transaction_info` table. All the data in the column will be lost.
  - You are about to drop the column `paymentType` on the `transaction_info` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `inventories` DROP FOREIGN KEY `inventories_transactionId_fkey`;

-- DropForeignKey
ALTER TABLE `transaction_info` DROP FOREIGN KEY `transaction_info_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `transaction_info` DROP FOREIGN KEY `transaction_info_partyId_fkey`;

-- DropIndex
DROP INDEX `inventories_transactionId_fkey` ON `inventories`;

-- DropIndex
DROP INDEX `transaction_info_customerId_fkey` ON `transaction_info`;

-- DropIndex
DROP INDEX `transaction_info_partyId_fkey` ON `transaction_info`;

-- AlterTable
ALTER TABLE `inventories` ADD COLUMN `customerId` INTEGER NULL,
    ADD COLUMN `partyId` INTEGER NULL;

-- AlterTable
ALTER TABLE `journals` ADD COLUMN `customerId` INTEGER NULL,
    ADD COLUMN `partyId` INTEGER NULL;

-- AlterTable
ALTER TABLE `transaction_info` DROP COLUMN `customerId`,
    DROP COLUMN `partyId`,
    DROP COLUMN `paymentType`;

-- AddForeignKey
ALTER TABLE `inventories` ADD CONSTRAINT `inventories_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `parties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventories` ADD CONSTRAINT `inventories_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journals` ADD CONSTRAINT `journals_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `parties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journals` ADD CONSTRAINT `journals_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

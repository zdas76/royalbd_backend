/*
  Warnings:

  - You are about to drop the column `customerId` on the `journals` table. All the data in the column will be lost.
  - You are about to drop the column `partyId` on the `journals` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `journals` DROP FOREIGN KEY `journals_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `journals` DROP FOREIGN KEY `journals_partyId_fkey`;

-- DropIndex
DROP INDEX `journals_customerId_fkey` ON `journals`;

-- DropIndex
DROP INDEX `journals_partyId_fkey` ON `journals`;

-- AlterTable
ALTER TABLE `journals` DROP COLUMN `customerId`,
    DROP COLUMN `partyId`;

-- AlterTable
ALTER TABLE `transaction_info` ADD COLUMN `customerId` INTEGER NULL,
    ADD COLUMN `partyId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `transaction_info` ADD CONSTRAINT `transaction_info_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `parties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_info` ADD CONSTRAINT `transaction_info_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

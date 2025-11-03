-- AlterTable
ALTER TABLE `inventories` ADD COLUMN `transactionId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `inventories` ADD CONSTRAINT `inventories_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transaction_info`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

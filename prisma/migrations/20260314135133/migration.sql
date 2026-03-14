-- DropIndex
DROP INDEX `transaction_info_voucherNo_voucherType_idx` ON `transaction_info`;

-- AlterTable
ALTER TABLE `account_items` MODIFY `accountsItemId` VARCHAR(6) NOT NULL;

-- AlterTable
ALTER TABLE `transaction_info` MODIFY `date` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE INDEX `transaction_info_voucherNo_voucherType_partyId_customerId_idx` ON `transaction_info`(`voucherNo`, `voucherType`, `partyId`, `customerId`);

-- AddForeignKey
ALTER TABLE `log_Order_Items` ADD CONSTRAINT `log_Order_Items_logGradeId_fkey` FOREIGN KEY (`logGradeId`) REFERENCES `logGrades`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

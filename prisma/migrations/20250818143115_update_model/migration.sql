-- AlterTable
ALTER TABLE `parties` MODIFY `openingAmount` DOUBLE NULL DEFAULT 0.00,
    MODIFY `openingDate` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE `log_order_by_category` ADD CONSTRAINT `log_order_by_category_logCategoryId_fkey` FOREIGN KEY (`logCategoryId`) REFERENCES `logcategories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

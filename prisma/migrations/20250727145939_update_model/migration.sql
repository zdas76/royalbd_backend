/*
  Warnings:

  - You are about to drop the column `closingAmount` on the `parties` table. All the data in the column will be lost.
  - You are about to drop the column `closingDate` on the `parties` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `parties` DROP COLUMN `closingAmount`,
    DROP COLUMN `closingDate`,
    ADD COLUMN `openingAmount` DOUBLE NOT NULL DEFAULT 0.00,
    ADD COLUMN `openingDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

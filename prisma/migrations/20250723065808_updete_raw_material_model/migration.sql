/*
  Warnings:

  - Added the required column `amount` to the `raw_materials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openingDate` to the `raw_materials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `raw_materials` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `raw_materials` ADD COLUMN `amount` DOUBLE NOT NULL,
    ADD COLUMN `openingDate` DATETIME(3) NOT NULL,
    ADD COLUMN `quantity` DOUBLE NOT NULL;

/*
  Warnings:

  - Added the required column `unitPrice` to the `raw_materials` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `raw_materials` ADD COLUMN `unitPrice` DOUBLE NOT NULL;

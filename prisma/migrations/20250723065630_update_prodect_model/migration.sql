/*
  Warnings:

  - You are about to drop the column `color` on the `products` table. All the data in the column will be lost.
  - Added the required column `amount` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openingDate` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `products` DROP COLUMN `color`,
    ADD COLUMN `amount` DOUBLE NOT NULL,
    ADD COLUMN `openingDate` DATETIME(3) NOT NULL,
    ADD COLUMN `quantity` DOUBLE NOT NULL;

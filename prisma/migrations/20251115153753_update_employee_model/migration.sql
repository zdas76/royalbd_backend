-- AlterTable
ALTER TABLE `employees` ADD COLUMN `employeeType` ENUM('Wroker', 'employee') NOT NULL DEFAULT 'employee',
    MODIFY `email` VARCHAR(30) NULL;

/*
  Warnings:

  - You are about to drop the column `present_days` on the `employee_monthly_attendance` table. All the data in the column will be lost.
  - You are about to drop the column `present_days` on the `payroll_items` table. All the data in the column will be lost.
  - Added the required column `absent_days` to the `payroll_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Rename present_days -> absent_days (keeps old data)
ALTER TABLE "employee_monthly_attendance"
RENAME COLUMN "present_days" TO "absent_days";

-- Add new fields
ALTER TABLE "employee_monthly_attendance"
ADD COLUMN "holidays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "working_days" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
-- Rename present_days -> absent_days (keeps old data)
ALTER TABLE "payroll_items"
RENAME COLUMN "present_days" TO "absent_days";

-- Add new fields
ALTER TABLE "payroll_items"
ADD COLUMN "holidays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "working_days" INTEGER NOT NULL DEFAULT 0;

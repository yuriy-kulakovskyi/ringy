/*
  Warnings:

  - Made the column `userEmail` on table `Account` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "userEmail" SET NOT NULL;

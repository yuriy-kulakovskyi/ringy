/*
  Warnings:

  - A unique constraint covering the columns `[userEmail]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "userEmail" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Account_userEmail_key" ON "Account"("userEmail");

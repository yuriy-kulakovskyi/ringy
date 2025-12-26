/*
  Warnings:

  - You are about to drop the column `expires_at` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `tokens_left` on the `Account` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tokensLeft` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "expires_at",
DROP COLUMN "tokens_left",
ADD COLUMN     "expiresAt" INTEGER,
ADD COLUMN     "tokensLeft" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_key" ON "Account"("userId");

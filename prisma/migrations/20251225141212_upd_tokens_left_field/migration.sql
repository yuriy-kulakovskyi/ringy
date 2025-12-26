/*
  Warnings:

  - You are about to drop the column `tokensLeft` on the `Account` table. All the data in the column will be lost.
  - Added the required column `tokens_left` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "tokensLeft",
ADD COLUMN     "tokens_left" INTEGER NOT NULL;

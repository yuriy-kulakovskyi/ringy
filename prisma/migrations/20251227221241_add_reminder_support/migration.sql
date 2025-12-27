-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "processed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Outbox" ADD COLUMN     "reminderAt" TIMESTAMP(3);

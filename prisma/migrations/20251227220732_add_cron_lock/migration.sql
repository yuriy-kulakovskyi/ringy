-- CreateTable
CREATE TABLE "cron_lock" (
    "name" TEXT NOT NULL,
    "locked_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cron_lock_pkey" PRIMARY KEY ("name")
);

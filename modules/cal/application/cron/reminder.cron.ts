import cron from "node-cron";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

import { logger } from "@shared/logger/logger";
import { env } from "@config/env";
import prisma from "prisma/prisma.service";
import { acquireLock, releaseLock } from "@infrastructure/lock/lock.client";

export const startReminderCron = () => {
  cron.schedule("* * * * *", async () => {
    const lockName = "reminder-cron";

    const hasLock = await acquireLock(lockName);
    if (!hasLock) {
      logger.info("Reminder cron skipped — lock already acquired");
      return;
    }

    try {
      const now = dayjs.utc();

      const reminders = await prisma.outbox.findMany({
        where: {
          type: "REMINDER",
          processed: false,
          reminderAt: { lte: now.toDate() },
        },
      });

      for (const r of reminders) {
        const payload = r.payload && typeof r.payload === "object" ? (r.payload as Record<string, any>) : null;
        const bookingId = payload?.bookingId ? String(payload.bookingId) : undefined;

        if (!bookingId) {
          logger.warn(`Skipping reminder ${r.id} because bookingId is missing in payload`);
          await prisma.outbox.update({
            where: { id: r.id },
            data: { processed: true },
          });
          continue;
        }

        const phone = payload?.phone;


        const startTime = await prisma.booking.findFirst({
          where: {
            bookingId,
          },
          select: {
            startTime: true,
          },
        })

        if (!phone) {
          logger.warn(`Skipping reminder ${r.id} because phone number is missing in payload`);
          continue;
        }

        logger.info(`Calling ${phone} for booking ${bookingId}`);

        const response = await fetch(env.VAPI_CALL_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.VAPI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assistantId: env.ASSISTANT_ID,
            phoneNumberId: env.PHONE_NUMBER_ID,
            customer: {
              number: phone,
            },
            assistantOverrides: {
              model: {
                provider: "openai",
                model: "gpt-4o",
                messages: [
                  {
                    role: "system",
                    content: "You are calling about booking {{booking_id}}. This is going to happen in {{start_time}} format it to a more human-readable form."
                  }
                ]
              },
              firstMessage: "Hi! I'm calling regarding your booking {{booking_id}}. You have a scheduled meeting at {{start_time}}.",
              variableValues: {
                booking_id: bookingId,
                start_time: startTime?.startTime ? dayjs(startTime.startTime).format("YYYY-MM-DD HH:mm:ss") : undefined,
              }
            }
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`VAPI call failed: ${error}`);
        }

        const callData = await response.json();
        console.log("Call data:", callData); 

        await prisma.$transaction([
          prisma.outbox.update({
            where: { id: r.id },
            data: { processed: true },
          }),
          prisma.booking.update({
            where: { bookingId },
            data: {
              calledAt: new Date()
            },
          }),
        ]);
      }
    } catch (err) {
      logger.error(err);
    } finally {
      await releaseLock(lockName);
    }
  });
}
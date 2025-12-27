import { inject, injectable } from "tsyringe";
import { Request, Response, NextFunction } from "express";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import cron from "node-cron";

dayjs.extend(utc);

import { logger } from "@shared/logger/logger";
import { env } from "@config/env";
import { WebhooksCalService } from "@modules/cal/application/services/cal.service";
import { CAL_SERVICE } from "@modules/cal/domain/tokens/cal.tokens";
import { AppError } from "@shared/errors/app-error";
import prisma from "prisma/prisma.service";
import { Attendee } from "../domain/interfaces/attendee.interface";

@injectable()
export class WebhooksCalHandler {
  constructor(
    @inject(CAL_SERVICE)
    private readonly calService: WebhooksCalService
  ) { 
    this.startReminderCron();
  }

  async handleWebhook(req: Request, res: Response) {
    const { triggerEvent: eventType, payload } = req.body;

    const { bookingId: bookingIdPayload, startTime, organizer: organizerObject, attendees } = payload || {};

    const bookingId = bookingIdPayload.toString();
    const organizer = organizerObject?.name || "Unknown Organizer";

    if (!['BOOKING_CREATED', 'BOOKING_RESCHEDULED', 'BOOKING_CANCELLED'].includes(eventType)) {
      return res.sendStatus(200);
    }

    if (!bookingId) {
      return res.sendStatus(200);
    }

    // TODO: Replace with actual phone from payload when available
    const phone = "21093912";

    const attendeesNames = attendees?.map((a: Attendee) => a.name) || "No attendees";

    try {
      if (eventType === "BOOKING_CREATED" || eventType === "BOOKING_RESCHEDULED") {
        const callTime = dayjs.utc(startTime);
        const reminderAt = callTime.subtract(3, "hour");

        await prisma.$transaction(async (tx) => {
          await tx.booking.upsert({
            where: { bookingId },
            update: {
              startTime: new Date(startTime),
              organizer,
              attendees: attendeesNames,
              calledAt: null,
              processed: false,
            },
            create: {
              bookingId,
              startTime: new Date(startTime),
              phone,
              organizer,
              attendees: attendeesNames,
              processed: false,
            },
          });

          await tx.outbox.create({
            data: {
              type: "REMINDER",
              payload: { bookingId },
              reminderAt: reminderAt.toDate(),
              processed: false,
            },
          });
        });

        return res.sendStatus(200);
      }

      if (eventType === "BOOKING_CANCELLED") {
        await prisma.$transaction(async (tx) => {
          const result = await tx.booking.updateMany({
            where: { bookingId },
            data: {
              calledAt: new Date(),
              processed: true,
            },
          });

          if (result.count === 0) {
            logger.warn(
              `BOOKING_CANCELLED received but booking not found: ${bookingId}`
            );
          }

          await tx.outbox.updateMany({
            where: {
              type: "REMINDER",
              processed: false,
              payload: { path: ["bookingId"], equals: bookingId },
            },
            data: { processed: true },
          });

          await tx.outbox.create({
            data: {
              type: "BOOKING_CANCELLED",
              payload: { bookingId },
              processed: true,
            },
          });
        });

        return res.sendStatus(200);
      }

      res.sendStatus(200);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  }

  async createWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        logger.error("WebhooksCalHandler.createWebhook: missing authenticated user");
        return next(new AppError(401, "Unauthorized"));
      }

      const apiKey = await this.calService.getUserApiKey(userId, "cal");
      if (!apiKey) {
        logger.error(`WebhooksCalHandler.createWebhook: API key not found for user ${userId}`);
        return next(new AppError(404, "API key not found for user"));
      }

      const response = await fetch(env.CAL_WEBHOOK_CREATION_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriberUrl: "https://d11665956206.ngrok-free.app/webhooks/cal",
          triggers: ["BOOKING_CREATED", "BOOKING_RESCHEDULED", "BOOKING_CANCELLED"],
          active: true,
          payloadTemplate: null,
        }),
      });

      if (!response.ok) {
        logger.error(`Failed to create CAL webhook with status ${response.status}`);
        throw new AppError(response.status, "Failed to create CAL webhook");
      }

      const data = await response.json();
      logger.info(`CAL webhook created successfully: ${JSON.stringify(data)}`);

      res.status(201).json({ message: "CAL webhook created", data });
    } catch (error) {
      logger.error(`Error creating CAL webhook: ${(error as Error).message}`);
      next(error);
    }
  }

  private startReminderCron() {
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

          logger.info(`Processing reminder for booking ${bookingId}`);

          // TODO: Integrate with VAPI to make the call here

          await prisma.$transaction([
            prisma.outbox.update({
              where: { id: r.id },
              data: { processed: true },
            }),
            prisma.booking.update({
              where: { bookingId },
              data: {
                calledAt: new Date(),
                processed: true,
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
}

async function acquireLock(name: string): Promise<boolean> {
  try {
    await prisma.cronLock.create({
      data: { name, lockedAt: new Date() },
    });
    return true;
  } catch {
    return false;
  }
}

async function releaseLock(name: string) {
  await prisma.cronLock.delete({ where: { name } });
}
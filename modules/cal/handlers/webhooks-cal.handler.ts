import { inject, injectable } from "tsyringe";
import { Request, Response, NextFunction } from "express";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
type CancellableJob = {
  stop: () => void;
};

import { logger } from "@shared/logger/logger";
import { env } from "@config/env";
import { WebhooksCalService } from "@modules/cal/application/services/cal.service";
import { CAL_SERVICE } from "@modules/cal/domain/tokens/cal.tokens";
import { AppError } from "@shared/errors/app-error";
import prisma from "prisma/prisma.service";
import { Attendee } from "../domain/interfaces/attendee.interface";

@injectable()
export class WebhooksCalHandler {
  private static scheduledJobs: Map<string, CancellableJob> = new Map();

  constructor(
    @inject(CAL_SERVICE)
    private readonly calService: WebhooksCalService
  ) { }

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

    const phone = "21093912";

    const attendeesNames = attendees?.map((a: Attendee) => a.name) || "No attendees";

    try {
      if (eventType === 'BOOKING_CREATED' || eventType === 'BOOKING_RESCHEDULED') {
        await prisma.$transaction(async (tx) => {
          await tx.booking.upsert({
            where: { bookingId },
            update: {
              startTime: new Date(startTime),
              organizer,
              attendees: attendeesNames,
              calledAt: null,
            },
            create: {
              bookingId,
              startTime: new Date(startTime),
              phone,
              organizer,
              attendees: attendeesNames,
            },
          });

          await tx.outbox.create({
            data: { type: eventType, payload: { bookingId } },
          });
        });

        const callAt = dayjs.utc(startTime).subtract(3, 'hour');
        const delay = callAt.diff(dayjs.utc());

        console.log(
          `Scheduling call for booking ${bookingId} at ${callAt.toISOString()} (in ${delay} ms)`
        );

        // cancel previous (reschedule)
        const existingJob = WebhooksCalHandler.scheduledJobs.get(bookingId);
        if (existingJob) {
          existingJob.stop();
          WebhooksCalHandler.scheduledJobs.delete(bookingId);
        }

        const timeout = setTimeout(async () => {
          console.log(`Scheduled call for booking ${bookingId} is being processed.`);

          await prisma.outbox.updateMany({
            where: { payload: { path: ['bookingId'], equals: bookingId } },
            data: { processed: true },
          });
        }, delay);

        WebhooksCalHandler.scheduledJobs.set(bookingId, {
          stop: () => clearTimeout(timeout),
        });
      }

      if (eventType === 'BOOKING_CANCELLED') {
        await prisma.$transaction(async (tx) => {
          const result = await tx.booking.updateMany({
            where: { bookingId },
            data: { calledAt: new Date() },
          });

          if (result.count === 0) {
            logger.warn(`BOOKING_CANCELLED received but booking not found: ${bookingId}`);
          }

          await tx.outbox.create({
            data: { type: 'BOOKING_CANCELLED', payload: { bookingId } },
          });

          const job = WebhooksCalHandler.scheduledJobs.get(bookingId);
          if (job) {
            job.stop();
            WebhooksCalHandler.scheduledJobs.delete(bookingId);
            logger.info(`Cancelled scheduled cron job for booking ${bookingId}`);
          }
        });
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
          subscriberUrl: "https://2e12851e5c0b.ngrok-free.app/webhooks/cal",
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
}
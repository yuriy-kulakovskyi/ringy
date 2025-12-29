import { inject, injectable } from "tsyringe";
import { Request, Response, NextFunction } from "express";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

import { logger } from "@shared/logger/logger";
import { WebhooksCalService } from "@modules/cal/application/services/cal.service";
import { CAL_SERVICE } from "@modules/cal/domain/tokens/cal.tokens";
import { AppError } from "@shared/errors/app-error";
import { Attendee } from "../domain/interfaces/attendee.interface";
import { ACCOUNT_SERVICE } from "@modules/account/domain/tokens/account.tokens";
import { AccountService } from "@modules/account/application/services/account.service";
import { AccountEntity } from "@modules/account/domain/entities/account.entity";
import { vapiMakeCall } from "../application/services/vapi.service";
import { scheduledBookingsHandler } from "./scheduled-bookings.handler";
import { canceledBookingsHandler } from "./cancelled-bookings.handler";

@injectable()
export class WebhooksCalHandler {
  constructor(
    @inject(CAL_SERVICE)
    private readonly calService: WebhooksCalService,

    @inject(ACCOUNT_SERVICE)
    private readonly accountService: AccountService
  ) {}

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

    const memberEmails: string[] = [
      organizerObject?.email,
      ...(attendees?.map((a: Attendee) => a.email) ?? []),
    ].filter(Boolean);   

    const accounts: AccountEntity[] = [];

    for (const email of memberEmails) {
      const account = await this.accountService.getAccountByEmail(email);

      if (!account) {
        logger.warn(`No account found for email ${email} in webhook processing`);
        continue;
      }

      if (account.phoneNumber) {
        accounts.push(account);
      }
    }

    const attendeesNames: string[] =
      attendees?.map((a: Attendee) => a.name) ?? [];

    logger.info(`Processing webhook event ${eventType} for bookingId ${bookingId} with attendees: ${memberEmails.join(", ")}`);

    try {
      if (eventType === "BOOKING_CREATED" || eventType === "BOOKING_RESCHEDULED") {
        await scheduledBookingsHandler(
          bookingId,
          startTime,
          organizer,
          attendeesNames,
          accounts,
        );

        return res.sendStatus(200);
      }

      if (eventType === "BOOKING_CANCELLED") {
        await canceledBookingsHandler(
          bookingId,
        );

        return res.sendStatus(200);
      }
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  }

  async createWebhook(req: Request, res: Response, next: NextFunction) {
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

    await vapiMakeCall(res, next, apiKey);
  }
}
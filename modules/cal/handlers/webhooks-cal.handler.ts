import { inject, injectable } from "tsyringe";
import { Request, Response, NextFunction } from "express";
import { logger } from "@shared/logger/logger";
import { env } from "@config/env";
import { WebhooksCalService } from "@modules/cal/application/services/cal.service";
import { CAL_SERVICE } from "@modules/cal/domain/tokens/cal.tokens";
import { AppError } from "@shared/errors/app-error";

@injectable()
export class WebhooksCalHandler {
  constructor(
    @inject(CAL_SERVICE)
    private readonly calService: WebhooksCalService
  ) {}

  handleWebhook(req: Request, res: Response) {
    logger.info("Received valid CAL webhook test: " + JSON.stringify(req.body));
  
    res.status(200).json({ message: "Webhook received successfully" });
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
          subscriberUrl: "https://bf0b0edfe898.ngrok-free.app/webhooks/cal",
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
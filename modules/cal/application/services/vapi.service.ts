import { AppError } from "@shared/errors/app-error";
import { logger } from "@shared/logger/logger";
import { Response, NextFunction } from "express";
import { env } from "@config/env";

export const vapiMakeCall = async (res: Response, next: NextFunction, apiKey: string) => {
  if (!apiKey) {
    logger.error(`WebhooksCalHandler.createWebhook: API key is not provided`);
    return next(new AppError(404, "API key not found for user"));
  }
  
  try {
    const response = await fetch(env.CAL_WEBHOOK_CREATION_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // TODO: Replace with actual ngrok URL or dynamic URL from config
        subscriberUrl: "https://12f6d7869561.ngrok-free.app/webhooks/cal",
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
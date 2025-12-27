import { AppError } from "@shared/errors/app-error";
import { logger } from "@shared/logger/logger";
import prisma from "prisma/prisma.service";

export class WebhooksCalService {
  async getUserApiKey(userId: string, provider: string): Promise<string | null> {
    try {
      const apiKey = await prisma.calendar.findFirst({
        where: { userId, provider },
        select: { apiKey: true },
      });

      return apiKey ? apiKey.apiKey : null;
    } catch (error) {
      logger.error(`WebhooksCalService: Error fetching API key for userId ${userId}: ${error}`);
      throw new AppError(500, "Failed to fetch API key");
    }
  }
}
import { AppError } from "@shared/errors/app-error";
import prisma from "prisma/prisma.service";
import { logger } from "@shared/logger/logger";

export const canceledBookingsHandler = async (
  bookingId: string,
) => {
  try {
    await prisma.$transaction(async (tx) => {
      const result = await tx.booking.updateMany({
        where: { bookingId },
        data: {
          calledAt: new Date(),
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
          processed: true, // Mark as processed for VAPI not to call about meeting that is cancelled
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
  }

  catch (error) {
    throw new AppError(500, "Failed to handle cancelled booking");
  }
};
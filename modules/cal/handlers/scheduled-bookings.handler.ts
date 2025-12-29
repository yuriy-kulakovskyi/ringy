import dayjs from "dayjs";
import prisma from "prisma/prisma.service";
import { AccountEntity } from "@modules/account/domain/entities/account.entity";
import { AppError } from "@shared/errors/app-error";

export const scheduledBookingsHandler = async (
  bookingId: string,
  startTime: string,
  organizer: string,
  attendeesNames: string[],
  accounts: AccountEntity[],
) => {
  try {
    const callTime = dayjs.utc(startTime);

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
          organizer,
          attendees: attendeesNames,
        },
      });

      for (const account of accounts) {
        if (!account.phoneNumber) continue;

        const remindMinutes = account.remindBeforeMinutes ?? 180; 

        const reminderAt = callTime.subtract(remindMinutes, "minute");

        await tx.outbox.create({
          data: {
            type: "REMINDER",
            payload: {
              bookingId,
              phone: account.phoneNumber,
              accountId: account.id,
            },
            reminderAt: reminderAt.toDate(),
            processed: false,
          },
        });
      }
    });
  } catch (error) {
    throw new AppError(500, "Failed to handle scheduled booking");
  }
}
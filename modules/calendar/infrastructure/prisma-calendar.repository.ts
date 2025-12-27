import { CalendarEntity } from "@modules/calendar/domain/entities/calendar.entity";
import { CreateCalendarRequest } from "@modules/calendar/domain/interfaces/create-calendar.interface";
import { DeleteCalendarResponse } from "@modules/calendar/domain/interfaces/delete-calendar.interface";
import { UpdateCalendarRequest } from "@modules/calendar/domain/interfaces/update-calendar.interface";
import { CalendarRepository } from "./calendar.repository";
import { logger } from "@shared/logger/logger";
import prisma from "prisma/prisma.service";
import { AppError } from "@shared/errors/app-error";
import { Prisma } from "generated/prisma/client";

export class PrismaCalendarRepository implements CalendarRepository {
  async create(request: CreateCalendarRequest): Promise<CalendarEntity> {
    try {
      if (!prisma) {
        throw new AppError(500, "Prisma client is not initialized");
      }

      if (!request.userId || !request.accountId || !request.provider || !request.apiKey) {
        throw new AppError(404, "Missing required fields to create calendar");
      }

      const existingCalendar = await prisma.calendar.findFirst({
        where: {
          userId: request.userId,
          accountId: request.accountId,
          provider: request.provider,
        },
      });

      if (existingCalendar) {
        throw new AppError(409, "Calendar already exists for this user with the same account and provider...");
      }

      logger.info("PrismaCalendarRepository: Creating calendar...");

      const createdCalendar = await prisma.calendar.create({
        data: {
          userId: request.userId,
          accountId: request.accountId,
          provider: request.provider,
          apiKey: request.apiKey,
        },
      });

      logger.info("PrismaCalendarRepository: Calendar created successfully");

      return new CalendarEntity(
        createdCalendar.id,
        createdCalendar.userId,
        createdCalendar.accountId,
        createdCalendar.provider,
        createdCalendar.apiKey
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError(409, "Calendar already exists for this user with the same account and provider");
      }

      logger.error("PrismaCalendarRepository: Error creating calendar");
      throw new AppError(500, (error as Error).message);
    }
  }
  
  async update(request: UpdateCalendarRequest): Promise<CalendarEntity> {
    try {
      if (!request.id || !request.userId || !request.apiKey) {
        throw new AppError(404, "Calendar ID, User ID, and API Key are required for update");
      }

      logger.info(`PrismaCalendarRepository: Updating calendar with ID ${request.id}...`);

      const updateCalendar = await prisma.calendar.update({
        where: {
          id: request.id,
          userId: request.userId,
        },
        data: {
          apiKey: request.apiKey,
        },
      });

      logger.info(`PrismaCalendarRepository: Calendar with ID ${request.id} updated successfully`);

      return new CalendarEntity(
        updateCalendar.id,
        updateCalendar.userId,
        updateCalendar.accountId,
        updateCalendar.provider,
        updateCalendar.apiKey
      );

    } catch (error) {
      logger.error(`PrismaCalendarRepository: Error updating calendar with ID ${request.id}`);
      throw new AppError(500, (error as Error).message);
    }
  }

  async findById(id: string, userId: string): Promise<CalendarEntity | null> {
    try {
      if (!id || !userId) {
        throw new AppError(404, "Calendar ID and User ID are required");
      }

      const calendar = await prisma.calendar.findFirst({
        where: {
          id,
          userId,
          isDeleted: false,
        },
      });

      if (!calendar) {
        return null;
      }

      return new CalendarEntity(
        calendar.id,
        calendar.userId,
        calendar.accountId,
        calendar.provider,
        calendar.apiKey
      );
      
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, (error as Error).message);
    }
  }
  
  async findByUserId(userId: string): Promise<CalendarEntity[] | []> {
    try {
      if (!prisma) {
        throw new AppError(500, "Prisma client is not initialized");
      }

      if (!userId) {
        throw new AppError(404, "User ID is required");
      }

      const trimmedUserId = userId.trim();
      logger.info(`PrismaCalendarRepository: findByUserId called with userId="${trimmedUserId}"`);

      const calendars = await prisma.calendar.findMany({
        where: {
          userId: trimmedUserId,
          isDeleted: false,
        },
      });

      logger.info(`PrismaCalendarRepository: Found ${calendars.length} calendars for userId: ${trimmedUserId}`);
      logger.debug(`PrismaCalendarRepository: calendars payload: ${JSON.stringify(calendars)}`);

      if (!calendars || calendars.length === 0) {
        return [];
      }

      return calendars.map(calendar => new CalendarEntity(
        calendar.id,
        calendar.userId,
        calendar.accountId,
        calendar.provider,
        calendar.apiKey
      ));
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, (error as Error).message);
    }
  }

  async delete(id: string): Promise<DeleteCalendarResponse> {
    try {
      if (!id) {
        throw new AppError(404, "Calendar ID is required for deletion");
      }

      await prisma.calendar.update({
        where: { id },
        data: {
          isDeleted: true,
        }
      });

      return {
        success: true,
        id,
        message: "Calendar deleted successfully",
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, (error as Error).message);
    }
  }
}
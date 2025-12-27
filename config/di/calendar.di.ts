import { container } from "tsyringe";

import { 
  CALENDAR_REPOSITORY, 
  CALENDAR_SERVICE,
  CREATE_CALENDAR_USE_CASE,
  GET_CALENDAR_USE_CASE,
  GET_USER_CALENDARS_USE_CASE,
  UPDATE_CALENDAR_USE_CASE,
  DELETE_CALENDAR_USE_CASE,
  CALENDAR_CONTROLLER
} from "@modules/calendar/domain/tokens/calendar.tokens";

import { PrismaCalendarRepository } from "@modules/calendar/infrastructure/prisma-calendar.repository";

import { CalendarService } from "@modules/calendar/application/services/calendar.service";

import { CreateCalendarUseCase } from "@modules/calendar/application/usecases/create-calendar.usecase";
import { GetCalendarUseCase } from "@modules/calendar/application/usecases/get-calendar.usecase";
import { GetUserCalendarsUseCase } from "@modules/calendar/application/usecases/get-user-calendars.usecase";
import { UpdateCalendarUseCase } from "@modules/calendar/application/usecases/update-calendar.usecase";
import { DeleteCalendarUseCase } from "@modules/calendar/application/usecases/delete-calendar.usecase";

import { CalendarController } from "@modules/calendar/controllers/calendar.controller";

container.register(CALENDAR_REPOSITORY, {
  useClass: PrismaCalendarRepository
})

container.register(CALENDAR_SERVICE, {
  useClass: CalendarService
})

container.register(CREATE_CALENDAR_USE_CASE, {
  useClass: CreateCalendarUseCase
})

container.register(GET_CALENDAR_USE_CASE, {
  useClass: GetCalendarUseCase
})

container.register(GET_USER_CALENDARS_USE_CASE, {
  useClass: GetUserCalendarsUseCase
})

container.register(UPDATE_CALENDAR_USE_CASE, {
  useClass: UpdateCalendarUseCase
})

container.register(DELETE_CALENDAR_USE_CASE, {
  useClass: DeleteCalendarUseCase
})

container.register(CALENDAR_CONTROLLER, {
  useClass: CalendarController
})
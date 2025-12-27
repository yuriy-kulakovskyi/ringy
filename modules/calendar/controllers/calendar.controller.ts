import { inject, injectable } from "tsyringe";

import { Request, Response } from "express";

import { 
  CREATE_CALENDAR_USE_CASE, 
  DELETE_CALENDAR_USE_CASE, 
  GET_CALENDAR_USE_CASE, 
  GET_USER_CALENDARS_USE_CASE, 
  UPDATE_CALENDAR_USE_CASE 
} from "@modules/calendar/domain/tokens/calendar.tokens";

import { CreateCalendarUseCase } from "@modules/calendar/application/usecases/create-calendar.usecase";
import { GetCalendarUseCase } from "@modules/calendar/application/usecases/get-calendar.usecase";
import { GetUserCalendarsUseCase } from "@modules/calendar/application/usecases/get-user-calendars.usecase";
import { UpdateCalendarUseCase } from "@modules/calendar/application/usecases/update-calendar.usecase";
import { DeleteCalendarUseCase } from "@modules/calendar/application/usecases/delete-calendar.usecase";

import { CreateCalendarRequest } from "@modules/calendar/domain/interfaces/create-calendar.interface";
import { UpdateCalendarRequest } from "@modules/calendar/domain/interfaces/update-calendar.interface";

@injectable()
export class CalendarController {
  constructor(
    @inject(CREATE_CALENDAR_USE_CASE)
    private readonly createCalendarUseCase: CreateCalendarUseCase,

    @inject(GET_CALENDAR_USE_CASE)
    private readonly getCalendarUseCase: GetCalendarUseCase,

    @inject(GET_USER_CALENDARS_USE_CASE)
    private readonly getUserCalendarsUseCase: GetUserCalendarsUseCase,

    @inject(UPDATE_CALENDAR_USE_CASE)
    private readonly updateCalendarUseCase: UpdateCalendarUseCase,

    @inject(DELETE_CALENDAR_USE_CASE)
    private readonly deleteCalendarUseCase: DeleteCalendarUseCase
  ) {}

  async createCalendar(req: Request, res: Response) {
    const request: CreateCalendarRequest = {
      userId: req.user.user_id,
      accountId: req.body.accountId,
      provider: req.body.provider,
      apiKey: req.body.apiKey,
    };

    const calendar = await this.createCalendarUseCase.execute(request);
    res.status(201).json(calendar);
  }

  async getCalendar(req: Request, res: Response) {
    const id = req.params.id;
    const userId = req.user.user_id;

    const calendar = await this.getCalendarUseCase.execute(id, userId);
    res.status(200).json(calendar);
  }

  async getUserCalendars(req: Request, res: Response) {
    const userId = req.user.user_id;
    const calendars = await this.getUserCalendarsUseCase.execute(userId);
    res.status(200).json(calendars);
  }

  async updateCalendar(req: Request, res: Response) {
    const request: UpdateCalendarRequest = {
      id: req.params.id,
      userId: req.user.user_id,
      apiKey: req.body.apiKey,
    };

    const updatedCalendar = await this.updateCalendarUseCase.execute(request);
    res.status(200).json(updatedCalendar);
  }

  async deleteCalendar(req: Request, res: Response) {
    const id = req.params.id;
    const result = await this.deleteCalendarUseCase.execute(id);
    res.status(200).json(result);
  }
}
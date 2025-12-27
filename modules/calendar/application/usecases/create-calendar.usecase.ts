import { inject, injectable } from "tsyringe";
import { CALENDAR_SERVICE } from "@modules/calendar/domain/tokens/calendar.tokens";
import { CalendarService } from "@modules/calendar/application/services/calendar.service";
import { CreateCalendarRequest } from "@modules/calendar/domain/interfaces/create-calendar.interface";

@injectable()
export class CreateCalendarUseCase {
  constructor(
    @inject(CALENDAR_SERVICE)
    private readonly calendarService: CalendarService
  ) {}

  execute(request: CreateCalendarRequest) {
    return this.calendarService.createCalendar(request);
  }
}
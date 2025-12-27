import { inject, injectable } from "tsyringe";
import { CALENDAR_SERVICE } from "@modules/calendar/domain/tokens/calendar.tokens";
import { CalendarService } from "@modules/calendar/application/services/calendar.service";
import { UpdateCalendarRequest } from "@modules/calendar/domain/interfaces/update-calendar.interface";

@injectable()
export class UpdateCalendarUseCase {
  constructor(
    @inject(CALENDAR_SERVICE)
    private readonly calendarService: CalendarService
  ) {}

  execute(request: UpdateCalendarRequest) {
    return this.calendarService.updateCalendar(request);
  }
}
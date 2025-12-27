import { inject, injectable } from "tsyringe";
import { CALENDAR_SERVICE } from "@modules/calendar/domain/tokens/calendar.tokens";
import { CalendarService } from "@modules/calendar/application/services/calendar.service";

@injectable()
export class DeleteCalendarUseCase {
  constructor(
    @inject(CALENDAR_SERVICE)
    private readonly calendarService: CalendarService
  ) {}

  execute(id: string) {
    return this.calendarService.deleteCalendar(id);
  }
}
import { inject, injectable } from "tsyringe";
import { CALENDAR_SERVICE } from "@modules/calendar/domain/tokens/calendar.tokens";
import { CalendarService } from "@modules/calendar/application/services/calendar.service";

@injectable()
export class GetUserCalendarsUseCase {
  constructor(
    @inject(CALENDAR_SERVICE)
    private readonly calendarService: CalendarService
  ) {}

  execute(userId: string) {
    return this.calendarService.getCalendarsByUserId(userId);
  }
}
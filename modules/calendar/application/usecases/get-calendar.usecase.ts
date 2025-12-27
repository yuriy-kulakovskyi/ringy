import { inject, injectable } from "tsyringe";
import { CALENDAR_SERVICE } from "@modules/calendar/domain/tokens/calendar.tokens";
import { CalendarService } from "@modules/calendar/application/services/calendar.service";

@injectable()
export class GetCalendarUseCase {
  constructor(
    @inject(CALENDAR_SERVICE)
    private readonly calendarService: CalendarService
  ) {}

  execute(id: string, userId: string) {
    return this.calendarService.getCalendarById(id, userId);
  }
}
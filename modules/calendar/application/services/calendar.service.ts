import { inject, injectable } from "tsyringe";
import { CALENDAR_REPOSITORY } from "@modules/calendar/domain/tokens/calendar.tokens";
import { CalendarRepository } from "@modules/calendar/infrastructure/calendar.repository";
import { CreateCalendarRequest } from "@modules/calendar/domain/interfaces/create-calendar.interface";
import { UpdateCalendarRequest } from "@modules/calendar/domain/interfaces/update-calendar.interface";

@injectable()
export class CalendarService {
  constructor(
    @inject(CALENDAR_REPOSITORY)
    private readonly calendarRepository: CalendarRepository
  ) {}

  getCalendarById(id: string, userId: string) {
    return this.calendarRepository.findById(id, userId);
  }

  async getCalendarsByUserId(userId: string) {
    return this.calendarRepository.findByUserId(userId);
  }

  async createCalendar(request: CreateCalendarRequest) {
    return this.calendarRepository.create(request);
  }

  async deleteCalendar(id: string) {
    return this.calendarRepository.delete(id);
  }

  async updateCalendar(request: UpdateCalendarRequest) {
    return this.calendarRepository.update(request);
  }
}
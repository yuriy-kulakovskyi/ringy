import { CalendarEntity } from "@modules/calendar/domain/entities/calendar.entity";
import { CreateCalendarRequest } from "@modules/calendar/domain/interfaces/create-calendar.interface";
import { UpdateCalendarRequest } from "@modules/calendar/domain/interfaces/update-calendar.interface";
import { DeleteCalendarResponse } from "@modules/calendar/domain/interfaces/delete-calendar.interface";

export interface CalendarRepository {
  create(request: CreateCalendarRequest): Promise<CalendarEntity>;
  update(request: UpdateCalendarRequest): Promise<CalendarEntity>;
  findById(id: string, userId: string): Promise<CalendarEntity | null>;
  findByUserId(userId: string): Promise<CalendarEntity[] | []>;
  delete(id: string): Promise<DeleteCalendarResponse>;
}
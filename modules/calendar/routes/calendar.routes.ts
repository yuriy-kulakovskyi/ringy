import { container } from "tsyringe";
import express from "express";

import { CalendarController } from "@modules/calendar/controllers/calendar.controller";
import { authMiddleware } from "@presentation/auth.guard";
import { validateInput } from "@shared/middlewares/validate-input.middleware";
import { CreateCalendarDto } from "@shared/dto/calendar/create-calendar.dto";
import { asyncHandler } from "@shared/http/async-handler";
import { UpdateCalendarDto } from "@shared/dto/calendar/update-calendar.dto";

const calendarController = container.resolve(CalendarController);

const router = express.Router();

router.post("/", authMiddleware, validateInput(CreateCalendarDto), asyncHandler(calendarController.createCalendar.bind(calendarController)));
router.patch("/:id", authMiddleware, validateInput(UpdateCalendarDto), asyncHandler(calendarController.updateCalendar.bind(calendarController)));
router.get("/collection", authMiddleware, asyncHandler(calendarController.getUserCalendars.bind(calendarController)));
router.get("/:id", authMiddleware, asyncHandler(calendarController.getCalendar.bind(calendarController)));
router.delete("/:id", authMiddleware, asyncHandler(calendarController.deleteCalendar.bind(calendarController)));

export { router as calendar };
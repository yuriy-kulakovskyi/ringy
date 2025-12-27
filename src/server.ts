import 'reflect-metadata';
import '@config/di/account.di'; 
import '@config/di/calendar.di';

import { account } from "@modules/account/routes/account.routes";
import { user } from "@modules/user/routes/user.routes";
import { app } from "./app";
import { Request, Response, NextFunction } from "express";
import { HttpErrorResponse } from "@shared/interfaces/http/http.responses.interface";
import { allExceptionsFilter } from "@shared/filters/all-exceptions.filter";
import { env } from '@config/env';
import { logger } from '@shared/logger/logger';
import { webhooksCal } from '@modules/cal/routes/webhooks-cal.routes';
import { calendar } from '@modules/calendar/routes/calendar.routes';

app.use("/user", user);
app.use("/account", account);
app.use("/webhooks/cal", webhooksCal);
app.use("/calendar", calendar);

app.use((
  err: Error,
  req: Request,
  res: Response<HttpErrorResponse>,
  next: NextFunction
) => {
  allExceptionsFilter(err, req, res, next);
});

app.listen(env.PORT, () => {
  logger.info(`Server is running on port ${env.PORT}`);
});
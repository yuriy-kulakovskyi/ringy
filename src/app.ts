import "reflect-metadata";
import express from "express";
import { Request, Response, NextFunction } from "express";

import { httpLogger } from "@shared/logger/http-logger";
import { env } from "@config/env";
import { HttpErrorResponse } from "@shared/interfaces/http/http.responses.interface";
import { allExceptionsFilter } from "@shared/filters/all-exceptions.filter";
import { logger } from "@shared/logger/logger";

export const app = express()
app.use(express.json());

app.use((
  err: Error,
  req: Request,
  res: Response<HttpErrorResponse>,
  next: NextFunction
) => {
  allExceptionsFilter(err, req, res, next);
});

app.use(httpLogger);

app.listen(env.PORT, () => {
  logger.info(`Server is running on port ${env.PORT}`);
});
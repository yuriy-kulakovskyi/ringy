import "reflect-metadata";
import express from "express";

import { httpLogger } from "@shared/logger/http-logger";
import { env } from "@config/env";
import { logger } from "@shared/logger/logger";

export const app = express()
app.use(express.json());

app.use(httpLogger);

app.listen(env.PORT, () => {
  logger.info(`Server is running on port ${env.PORT}`);
});
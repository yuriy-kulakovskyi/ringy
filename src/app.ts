import "reflect-metadata";
import express from "express";

import { httpLogger } from "@shared/logger/http-logger";

export const app = express()
app.use(express.json());

app.use(httpLogger);
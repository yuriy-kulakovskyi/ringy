import 'reflect-metadata';
import '@config/di/account.di'; 
import { account } from "@modules/account/routes/account.routes";
import { user } from "@modules/user/routes/user.routes";
import { app } from "./app";
import { Request, Response, NextFunction } from "express";
import { HttpErrorResponse } from "@shared/interfaces/http/http.responses.interface";
import { allExceptionsFilter } from "@shared/filters/all-exceptions.filter";

app.use("/user", user);
app.use("/account", account);

app.use((
  err: Error,
  req: Request,
  res: Response<HttpErrorResponse>,
  next: NextFunction
) => {
  allExceptionsFilter(err, req, res, next);
});
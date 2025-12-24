import { Request, Response, NextFunction } from "express"
import { AppError } from "@shared/errors/app-error"
import { HttpErrorResponse } from "@shared/interfaces/http/http.responses.interface"
import { HttpStatus } from "@shared/enums/http.enum"

export const allExceptionsFilter = (
  err: Error,
  req: Request,
  res: Response<HttpErrorResponse>,
  next: NextFunction
) => {
  const status =
    err instanceof AppError ? err.statusCode : 500

  const detail =
    err instanceof AppError ? err.detail : "Internal Server Error"

  const response: HttpErrorResponse = {
    success: false,
    statusCode: status,
    timestamp: new Date().toISOString(),
    title: HttpStatus[status] ?? "Error",
    detail
  }

  if (!(err instanceof AppError)) {
    console.error(err)
  }

  res.status(status).json({
    ...response
  })
}
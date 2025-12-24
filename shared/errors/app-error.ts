export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly detail: string
  ) {
    super(detail)
    Error.captureStackTrace(this, this.constructor)
  }
}
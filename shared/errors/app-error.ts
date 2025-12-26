export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly detail: string,
    public readonly error?: string
  ) {
    super(detail)
    Error.captureStackTrace(this, this.constructor)
  }
}
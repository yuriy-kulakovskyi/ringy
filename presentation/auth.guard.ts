import { Request , Response, NextFunction } from "express"
import { AppError } from "@shared/errors/app-error"
import { container } from "tsyringe"
import { AlternativeAuthClient } from "@infrastructure/auth/alternative-auth.client"
import { IUserResponseResponse } from "@shared/interfaces/user/user.interface"
import { logger } from "@shared/logger/logger"

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const rawToken = req.headers.authorization

  if (!rawToken) {
    logger.error(`Auth middleware missing authorization header`);
    return next(new AppError(401, "Authorization token is missing"))
  }

  const token = rawToken.replace(/^Bearer\s+/i, '');
  if (!token || token === rawToken) {
    logger.error(`Auth middleware invalid authorization header format`);
    return next(new AppError(401, "Invalid authorization header"));
  }

  try {
    const authClient = container.resolve(AlternativeAuthClient)
    const data = await authClient.verify(token) as IUserResponseResponse;

    if (!data.user.user_id) {
      logger.error(`Auth middleware user not found in token response`);
      return next(new AppError(404, "User not found"))
    }

    logger.info(`Auth middleware authenticated user ${data.user.user_id}`);
    req.user = data.user;
    next()
  } catch (err) {
    const error = err as Error;
    if (error.message?.includes('expired') || error.name === 'TokenExpiredError') {
      logger.error(`Auth middleware token expired: ${error.message}`);
      return next(new AppError(401, "Token expired"));
    }
    logger.error(`Auth middleware invalid token: ${error.message}`);
    next(new AppError(401, "Invalid token"));
  }
}
import { container } from "tsyringe"
import { Request , Response, NextFunction } from "express"
import { AppError } from "@shared/errors/app-error"
import { AlternativeAuthClient } from "@infrastructure/auth/alternative-auth.client"
import { IUserResponse } from "@shared/interfaces/user/user.interface"
import { logger } from "@shared/logger/logger"

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const rawToken = Array.isArray(header) ? header[0] : (header || "")

    if (!rawToken) {
      logger.error(`Auth middleware missing authorization header`)
      return next(new AppError(401, "Authorization token is missing"))
    }

    const match = rawToken.match(/^Bearer\s+(.+)$/i)
    if (!match) {
      logger.error(`Auth middleware invalid authorization header format`)
      return next(new AppError(401, "Invalid authorization header format"))
    }

    const token = match[1]

    const authClient = container.resolve(AlternativeAuthClient)
    const data = await authClient.verify(token) as IUserResponse | null

    if (!data) {
      logger.error(`Auth middleware no response from auth client`)
      return next(new AppError(401, "Authentication failed"))
    }

    if (!data.success) {
      logger.error(`Auth middleware authentication failed`)
      next(new AppError(401, "Authentication failed"))
    }

    if (!data.user?.user_id) {
      logger.error(`Auth middleware user not found in token response`)
      next(new AppError(404, "User not found"))
    }

    logger.info(`Auth middleware authenticated user ${data.user.user_id}`)
    req.user = data.user;
    next();
  } catch (err) {
    next(err); 
  }
}
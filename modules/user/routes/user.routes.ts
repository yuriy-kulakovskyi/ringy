import express from "express";
import { authMiddleware } from "@presentation/auth.guard";
import { AppError } from "@shared/errors/app-error";
import { Request, Response } from "express";
import { logger } from "@shared/logger/logger";

const router = express.Router();

router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    logger.info(`User ${req.user?.user_id} requested /me endpoint`);
    res.status(200).json({...req.user});
  } catch (error) {
    logger.error(`Error in /me endpoint: ${(error as Error).message}`);
    throw new AppError(500, "Not implemented");
  }
});

export { router as user };
import prisma from "prisma/prisma.service";
import { AccountRepository } from "./account.repository";
import { AppError } from "@shared/errors/app-error";
import { AccountEntity } from "@modules/account/domain/entities/account.entity";
import { logger } from "@shared/logger/logger";
import { Prisma } from "generated/prisma/client";

export class PrismaAccountRepository implements AccountRepository {
  async getMe(userId: string): Promise<AccountEntity | Partial<AccountEntity>> {
    try {
      if (!userId) {
        logger.error("PrismaAccountRepository getMe called with empty userId");
        throw new AppError(400, "User ID is required");
      }

      const account = await prisma.account.findUnique({
        where: { userId }
      });

      if (!account) {
        return {
          userId,
          type: "not_created_yet",
        };
      }

      logger.info(`PrismaAccountRepository getMe found account for userId: ${userId}`);
      return new AccountEntity(
        account.id,
        account.userId,
        account.type,
        account.tokensLeft,
        account.expiresAt ? new Date(account.expiresAt).getTime() : null,
      );
    } catch (error) {
      logger.error(`PrismaAccountRepository getMe error: ${(error as Error).message}`);
      throw new AppError(500, "Database error");
    }
  }

  async createAccount(userId: string) {
    try {
      if (!userId) {
        logger.error("PrismaAccountRepository createAccount called with empty userId");
        throw new AppError(400, "User ID is required");
      }

      const newAccount = await prisma.account.create({
        data: {
          userId: userId,
          type: "standard",
          tokensLeft: 100,
          expiresAt: null,
        },
      });

      logger.info(`PrismaAccountRepository createAccount created account for userId: ${userId}`);
      return new AccountEntity(
        newAccount.id,
        newAccount.userId,
        newAccount.type,
        newAccount.tokensLeft,
        newAccount.expiresAt ? new Date(newAccount.expiresAt).getTime() : null,
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        logger.error(`PrismaAccountRepository createAccount attempted to create duplicate account for userId: ${userId}`);
        throw new AppError(409, "Account already exists");
      }

      logger.error("PrismaAccountRepository createAccount error");
      throw new AppError(500, "Database error");
    }
  }
}
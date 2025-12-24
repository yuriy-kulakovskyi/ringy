import { container } from "tsyringe"
import { PrismaUserRepository } from "@modules/user/infrastructure/prisma-user.repository"
import { USER_REPOSITORY } from "@modules/user/domain/tokens/user.tokens"

container.register(USER_REPOSITORY, {
  useClass: PrismaUserRepository
})
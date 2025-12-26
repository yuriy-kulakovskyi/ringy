import { container } from "tsyringe";
import { ACCOUNT_REPOSITORY, ACCOUNT_SERVICE, CREATE_ACCOUNT_USECASE, GET_ME_USECASE } from "@modules/account/domain/tokens/account.tokens";
import { PrismaAccountRepository } from "@modules/account/infrastructure/prisma-account.repository";
import { CreateAccountUseCase } from "@modules/account/application/usecases/create-account.usecase";
import { GetMeUseCase } from "@modules/account/application/usecases/get-me.usecase";
import { AccountService } from "@modules/account/application/services/account.service";

container.register(ACCOUNT_REPOSITORY, {
  useClass: PrismaAccountRepository
})

container.register(CREATE_ACCOUNT_USECASE, {
  useClass: CreateAccountUseCase
})

container.register(GET_ME_USECASE, {
  useClass: GetMeUseCase
})

container.register(ACCOUNT_SERVICE, {
  useClass: AccountService
})
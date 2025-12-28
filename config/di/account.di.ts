import { container } from "tsyringe";
import { ACCOUNT_REPOSITORY, ACCOUNT_SERVICE, CREATE_ACCOUNT_USECASE, GET_ME_USECASE, UPDATE_ACCOUNT_USECASE } from "@modules/account/domain/tokens/account.tokens";
import { PrismaAccountRepository } from "@modules/account/infrastructure/prisma-account.repository";
import { CreateAccountUseCase } from "@modules/account/application/usecases/create-account.usecase";
import { GetMeUseCase } from "@modules/account/application/usecases/get-me.usecase";
import { AccountService } from "@modules/account/application/services/account.service";
import { UpdateAccountUseCase } from "@modules/account/application/usecases/update-account.usecase";

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

container.register(UPDATE_ACCOUNT_USECASE, {
  useClass: UpdateAccountUseCase
})
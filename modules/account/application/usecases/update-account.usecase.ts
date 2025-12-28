import { inject, injectable } from "tsyringe";
import { AccountEntity } from "@modules/account/domain/entities/account.entity";
import { UpdateAccountRequest } from "@modules/account/domain/interfaces/update-account.interface";
import { PrismaAccountRepository } from "@modules/account/infrastructure/prisma-account.repository";
import { ACCOUNT_REPOSITORY } from "@modules/account/domain/tokens/account.tokens";

@injectable()
export class UpdateAccountUseCase {
  constructor(
    @inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: PrismaAccountRepository,
  ) {}

  async execute(request: UpdateAccountRequest): Promise<AccountEntity> {
    const updatedAccount = await this.accountRepository.updateAccountSettings(request);
    return updatedAccount;
  }
}
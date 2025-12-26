import { inject, injectable } from "tsyringe";
import { ACCOUNT_REPOSITORY } from "@modules/account/domain/tokens/account.tokens";
import { PrismaAccountRepository } from "@modules/account/infrastructure/prisma-account.repository";

@injectable()
export class CreateAccountUseCase {
  constructor(
    @inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: PrismaAccountRepository
  ) {}

  async execute(userId: string) {
    const created = await this.accountRepository.createAccount(userId);
    return created;
  }
}
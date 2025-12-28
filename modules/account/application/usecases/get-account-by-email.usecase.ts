import { inject, injectable } from "tsyringe";
import { ACCOUNT_REPOSITORY } from "@modules/account/domain/tokens/account.tokens";
import { PrismaAccountRepository } from "@modules/account/infrastructure/prisma-account.repository";

@injectable()
export class GetAccountByEmailUseCase {
  constructor(
    @inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: PrismaAccountRepository,
  ) {}

  async execute(email: string) {
    return this.accountRepository.getAccountByEmail(email);
  }
}
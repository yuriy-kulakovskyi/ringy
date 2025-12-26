import { inject, injectable } from "tsyringe";
import { ACCOUNT_REPOSITORY } from "@modules/account/domain/tokens/account.tokens";
import { PrismaAccountRepository } from "@modules/account/infrastructure/prisma-account.repository";

@injectable()
export class GetMeUseCase {
  constructor(
    @inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: PrismaAccountRepository
  ) {}

  async execute(userId: string) {
    const account = await this.accountRepository.getMe(userId);
    return account;
  }
}
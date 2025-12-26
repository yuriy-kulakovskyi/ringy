import { inject, injectable } from "tsyringe";
import { ACCOUNT_SERVICE } from "../domain/tokens/account.tokens";
import { AccountService } from "../application/services/account.service";

@injectable()
export class AccountController {
  constructor(
    @inject(ACCOUNT_SERVICE)
    private readonly accountService: AccountService
  ) {}

  getMe(userId: string) {
    return this.accountService.getMe(userId);
  }

  createAccount(userId: string) {
    return this.accountService.createAccount(userId);
  }
}
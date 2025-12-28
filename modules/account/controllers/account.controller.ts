import { inject, injectable } from "tsyringe";
import { ACCOUNT_SERVICE } from "@modules/account/domain/tokens/account.tokens";
import { AccountService } from "@modules/account/application/services/account.service";
import { UpdateAccountRequest } from "@modules/account/domain/interfaces/update-account.interface";

@injectable()
export class AccountController {
  constructor(
    @inject(ACCOUNT_SERVICE)
    private readonly accountService: AccountService
  ) {}

  getMe(userId: string) {
    return this.accountService.getMe(userId);
  }

  createAccount(userId: string, userEmail: string) {
    return this.accountService.createAccount(userId, userEmail);
  }

  updateAccountSettings(request: UpdateAccountRequest) {
    return this.accountService.updateAccountSettings(request);
  }
}
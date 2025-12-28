import { inject, injectable } from "tsyringe";
import { CREATE_ACCOUNT_USECASE, GET_ACCOUNT_BY_EMAIL_USECASE, GET_ME_USECASE, UPDATE_ACCOUNT_USECASE } from "@modules/account/domain/tokens/account.tokens";
import { GetMeUseCase } from "../usecases/get-me.usecase";
import { CreateAccountUseCase } from "../usecases/create-account.usecase";
import { UpdateAccountRequest } from "@modules/account/domain/interfaces/update-account.interface";
import { UpdateAccountUseCase } from "@modules/account/application/usecases/update-account.usecase";
import { GetAccountByEmailUseCase } from "../usecases/get-account-by-email.usecase";

@injectable()
export class AccountService {
  constructor(
    @inject(GET_ME_USECASE)
    private readonly getMeUseCase: GetMeUseCase,

    @inject(CREATE_ACCOUNT_USECASE)
    private readonly createAccountUseCase: CreateAccountUseCase,

    @inject(UPDATE_ACCOUNT_USECASE)
    private readonly updateAccountSettingsUseCase: UpdateAccountUseCase,

    @inject(GET_ACCOUNT_BY_EMAIL_USECASE)
    private readonly getAccountByEmailUseCase: GetAccountByEmailUseCase,
  ) {}

  async getMe(userId: string) {
    return this.getMeUseCase.execute(userId);
  }

  async createAccount(userId: string, userEmail: string) {
    return this.createAccountUseCase.execute(userId, userEmail);
  }

  async updateAccountSettings(request: UpdateAccountRequest) {
    return this.updateAccountSettingsUseCase.execute(request);
  }

  async getAccountByEmail(email: string) {
    return this.getAccountByEmailUseCase.execute(email);
  }
}

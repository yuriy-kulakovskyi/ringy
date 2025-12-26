import { inject, injectable } from "tsyringe";
import { CREATE_ACCOUNT_USECASE, GET_ME_USECASE } from "@modules/account/domain/tokens/account.tokens";
import { GetMeUseCase } from "../usecases/get-me.usecase";
import { CreateAccountUseCase } from "../usecases/create-account.usecase";

@injectable()
export class AccountService {
  constructor(
    @inject(GET_ME_USECASE)
    private readonly getMeUseCase: GetMeUseCase,

    @inject(CREATE_ACCOUNT_USECASE)
    private readonly createAccountUseCase: CreateAccountUseCase
  ) {}

  async getMe(userId: string) {
    return this.getMeUseCase.execute(userId);
  }

  async createAccount(userId: string) {
    return this.createAccountUseCase.execute(userId);
  }
}

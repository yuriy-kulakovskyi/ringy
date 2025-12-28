import { AccountEntity } from "@modules/account/domain/entities/account.entity";
import { UpdateAccountRequest } from "@modules/account/domain/interfaces/update-account.interface";

export interface AccountRepository {
  getMe(userId: string): Promise<AccountEntity | Partial<AccountEntity>>;
  createAccount(userId: string): Promise<AccountEntity>;
  updateAccountSettings(request: UpdateAccountRequest): Promise<AccountEntity>;
}
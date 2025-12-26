import { AccountEntity } from "@modules/account/domain/entities/account.entity";

export interface AccountRepository {
  getMe(userId: string): Promise<AccountEntity | Partial<AccountEntity>>;
  createAccount(userId: string): Promise<AccountEntity>;
}
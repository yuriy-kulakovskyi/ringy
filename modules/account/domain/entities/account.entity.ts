export class AccountEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: string,
    public readonly tokensLeft: number,
    public readonly expiresAt: number | null
  ) {}
}
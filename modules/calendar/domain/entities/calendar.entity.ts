export class CalendarEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly accountId: string,
    public readonly provider: string,
    public readonly apiKey: string,
  ) {}
}
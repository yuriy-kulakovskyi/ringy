export interface UpdateAccountRequest {
  userId: string;
  phoneNumber?: string;
  remindBeforeMinutes?: number;
}
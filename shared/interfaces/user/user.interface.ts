export interface IUserResponse {
  success: boolean;
  user: IUser;
}

export interface IUser {
  user_id: string,
  email: string,
  first_name: string,
  last_name: string,
  role: string,
  picture: string,
  external_id: string
}
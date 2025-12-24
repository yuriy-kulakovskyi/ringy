import { IUserResponse } from "../user/user.interface"

declare global {
  namespace Express {
    interface Request {
      user: IUserResponseResponse['user'];
    }
  }
}

export {}
import { injectable } from "tsyringe";
import { UserRepository } from "./user.repository";

@injectable()
export class PrismaUserRepository implements UserRepository {}

export default new PrismaUserRepository();
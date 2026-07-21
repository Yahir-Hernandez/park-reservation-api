import { UserModel, CreateUserInput, User} from "@/types/model";
import { prisma } from "@/db/config";
import { createModel } from "./generic";

export const userModel: UserModel = createModel<
  User, 
  string, 
  CreateUserInput
>(
  prisma.user,
  'User',
  'USER_NOT_FOUND'
);


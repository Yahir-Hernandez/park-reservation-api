import { UserModel, CreateUserInput } from "../types/model";
import { prisma } from "../db/config";
import { User } from "../generated/prisma/client";
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


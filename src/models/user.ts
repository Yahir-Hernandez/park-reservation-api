import { UserModel, CreateUserInput, User } from "@/types/model";
import { prisma } from "@/db/config";
import { createModel } from "./generic";
import { Result } from '@/types/errors';

export const baseModel: UserModel = createModel<
  User,
  string,
  CreateUserInput
>(
  prisma.user,
  'User',
  'USER_NOT_FOUND'
);

export const userModel = Object.assign(baseModel, {
  async findByEmail(email: string): Promise<Result<User |  null>> {
    try {
      const found = await prisma.user.findFirst({
        where: {
          email: email,
        }
      });
      return {
        ok: true,
        data: found
      };
    } catch {
      return {
        ok: false,
        error: {
          textCode: 'INTERNAL_ERROR',
          message: 'Server internal error',
          status: 500,
        }
      };
    }
  },

  async findByUsername(usern: string): Promise<Result<User |  null>> {
    try {
      const found = await prisma.user.findFirst({
        where: {
          username: usern,
        }
      });
      return {
        ok: true,
        data: found
      };
    } catch {
      return {
        ok: false,
        error: {
          textCode: 'INTERNAL_ERROR',
          message: 'Server internal error',
          status: 500,
        }
      };
    }
  },
});



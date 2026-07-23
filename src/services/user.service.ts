import { User } from '@/types/model';
import { userModel } from '@/models/user';
import { Result, ErrorService} from '@/types/errors';
import { hash, verify } from '@node-rs/bcrypt';
import { report } from 'node:process';

export type OmitKeys = 'id' | 'createdAt' | 'updatedAt' | 'passwordHash';

export class UserServices {

  static async register(user: User): Promise<Result<Omit<User, OmitKeys>>> {
    const resp = await userModel.findByEmail(user.email);
    if (!resp.ok) return resp;
    if (resp.data) return { // null ó User
      ok: false,
      error: {
        textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
        message: 'The email address is already registered to another user.',
        status: 422,
      }
    };
    const resp1 = await userModel.findByUsername(user.username);
    if (!resp1.ok) return resp1;
    if (resp1.data) return { // null ó User
      ok: false,
      error: {
        textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
        message: 'The username already exists in the system.',
        status: 422,
      }
    };
    const hashedPassword = await hash(user.passwordHash, 10);
    const createdResult: Result<User> = await userModel.create({
      ...user,
      passwordHash: hashedPassword,
    });
    if (!createdResult.ok) return createdResult;
    const { id, createdAt, updatedAt, passwordHash, ...userPublic } = createdResult.data;
    return {
      ok: true,
      data: userPublic,
    };
  }

  static async login(email: string, password: string): Promise<Result<Omit<User, OmitKeys>>>{
    let errorLogin = {
      ok: false as const,
      error: {
        textCode: 'INVALID_CREDENTIALS',
        message: 'You could not log in',
        status: 422,
      } as ErrorService
    };
    const resp1 = await userModel.findByEmail(email);
    if (!resp1.ok) return resp1;
    const findedUser = resp1.data;
    if (!findedUser) return errorLogin;
    const validate = await verify(password, findedUser.passwordHash);
    if (!validate) return errorLogin;
    const { id, createdAt, updatedAt, passwordHash, ...userPublic } = findedUser;
    return {
      ok: true,
      data: userPublic
    }
  }
  
}

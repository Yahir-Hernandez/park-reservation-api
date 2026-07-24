import { User } from '@/types/model';
import { userModel } from '@/models/user';
import { Result, ErrorTextCode } from '@/types/errors';
import { hash, verify } from '@node-rs/bcrypt';

// Cambio deliberado respecto al codigo original: antes se ocultaban tambien
// 'id', 'createdAt' y 'updatedAt'. Se mantiene oculto unicamente 'passwordHash'
// (el unico dato sensible), ya que el controlador de autenticacion necesita el
// 'id' del usuario para emitir el JWT y un cliente normalmente necesita esos
// campos para renderizar la respuesta de registro/login.
export type OmitKeys = 'passwordHash';

export class UserServices {

  /**
   * Verifica que un campo unico (email o username) no este ya registrado.
   * Unifica el patron duplicado que existia en `register` para email y
   * username por separado.
   */
  private static async ensureUnique(
    finder: () => Promise<Result<User | null>>,
    conflictCode: ErrorTextCode,
    message: string
  ): Promise<Result<null>> {
    const result = await finder();
    if (!result.ok) return result;
    if (result.data) return {
      ok: false,
      error: {
        textCode: conflictCode,
        message,
        status: 409,
      }
    };
    return { ok: true, data: null };
  }

  static async register(user: User): Promise<Result<Omit<User, OmitKeys>>> {
    const emailCheck = await UserServices.ensureUnique(
      () => userModel.findByEmail(user.email),
      'EMAIL_ALREADY_EXISTS',
      'The email address is already registered to another user.'
    );
    if (!emailCheck.ok) return emailCheck;

    const usernameCheck = await UserServices.ensureUnique(
      () => userModel.findByUsername(user.username),
      'USERNAME_ALREADY_EXISTS',
      'The username already exists in the system.'
    );
    if (!usernameCheck.ok) return usernameCheck;

    const hashedPassword = await hash(user.passwordHash, 10);
    const createdResult: Result<User> = await userModel.create({
      ...user,
      passwordHash: hashedPassword,
    });
    if (!createdResult.ok) return createdResult;
    const { passwordHash: _passwordHash, ...userPublic } = createdResult.data;
    return {
      ok: true,
      data: userPublic,
    };
  }

  static async login(email: string, password: string): Promise<Result<Omit<User, OmitKeys>>> {
    const invalidCredentials: Result<Omit<User, OmitKeys>> = {
      ok: false,
      error: {
        textCode: 'INVALID_CREDENTIALS',
        message: 'You could not log in',
        status: 422,
      }
    };
    const resp1 = await userModel.findByEmail(email);
    if (!resp1.ok) return resp1;
    const findedUser = resp1.data;
    if (!findedUser) return invalidCredentials;
    const validate = await verify(password, findedUser.passwordHash);
    if (!validate) return invalidCredentials;
    const { passwordHash: _passwordHash, ...userPublic } = findedUser;
    return {
      ok: true,
      data: userPublic
    }
  }

}

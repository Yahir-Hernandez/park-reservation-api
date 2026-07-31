import { Request, Response } from 'express';
import { UserServices } from '@/services/user.service';
import { signToken } from '@/utils/jwt';
import { sendResult, sendValidationError } from '@/utils/http';
import { User } from '@/types/model';
import { missingFields } from '@/utils/validation';
import { CreateParkInput} from '@/types/model';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    /* 
    const body = (req.body ?? {}) as Record<string, unknown>;
    const missing = missingFields(body, ['name', 'lastname', 'username', 'email', 'password']);
    if (missing.length > 0) {
      sendValidationError(res, `Missing required fields: ${missing.join(', ')}.`);
      return;
    }
    */
    const body = req.body;

    // Se ignora deliberadamente cualquier "role" enviado en el body: el
    // registro público siempre crea usuarios 'cliente'. Crear cuentas de
    // administrador es una decisión operativa fuera del alcance de este
    // endpoint (no especificada en el prompt; se documenta como decisión de
    // seguridad explícita).
    const userPayload = {
      id: '',
      name: body.name,
      lastname: body.lastname,
      username: body.username,
      email: body.email,
      passwordHash: String(body.password),
      role: 'cliente',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;

    const result = await UserServices.register(userPayload);
    sendResult(res, result, 201);
  }

  static async login(req: Request, res: Response): Promise<void> {
    /* 
    const body = (req.body ?? {}) as Record<string, unknown>;
    const missing = missingFields(body, ['email', 'password']);
    if (missing.length > 0) {
      sendValidationError(res, `Missing required fields: ${missing.join(', ')}.`);
      return;
    }
    */
    const body = req.body;

    const result = await UserServices.login(body.email, body.password);
    if (!result.ok) {
      sendResult(res, result);
      return;
    }

    const token = signToken({ sub: result.data.id, role: result.data.role });
    res.status(200).json({ ok: true, data: { user: result.data, token } });
  }
}

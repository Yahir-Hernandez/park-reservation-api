import { Request, Response } from 'express';
import { userModel } from '@/models/user';
import { sendResult } from '@/utils/http';

/**
 * PIEZA INFERIDA: endpoint "perfil propio" (`GET /users/me`). No estaba
 * especificado en el prompt, pero es necesario para que un cliente
 * autenticado pueda conocer su propio id/rol/datos sin exponer un endpoint
 * genérico de "obtener usuario por id" a cualquier usuario autenticado.
 */
export class UserController {
  static async me(req: Request, res: Response): Promise<void> {
    const result = await userModel.getById(req.user!.id);
    if (!result.ok) {
      sendResult(res, result);
      return;
    }
    const { passwordHash: _passwordHash, ...userPublic } = result.data;
    res.status(200).json({ ok: true, data: userPublic });
  }
}

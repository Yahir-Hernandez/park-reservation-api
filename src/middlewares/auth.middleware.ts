import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '@/utils/jwt';
import { User } from '@/types/model';

/**
 * PIEZA INFERIDA / DISEÑADA (no especificada en detalle por el dueño del
 * proyecto): middleware de autenticación basado en JWT (`jsonwebtoken`).
 *
 * - `authenticate`: exige un header `Authorization: Bearer <token>` válido.
 *   Si falta o el token es inválido/expirado -> 401 (no autenticado).
 * - `authorize(...roles)`: exige que el usuario autenticado tenga uno de los
 *   roles indicados. Si no -> 403 (autenticado pero sin permiso).
 *
 * Se reutiliza el textCode 'UNAUTHORIZED' ya existente en `ErrorTextCode`
 * tanto para 401 como para 403, distinguiendo el caso real mediante el
 * campo `status`, tal como indica la convención del proyecto de no agregar
 * nuevos textCode sin declararlo explícitamente.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({
      ok: false,
      error: {
        textCode: 'UNAUTHORIZED',
        message: 'Missing or malformed Authorization header. Expected: Bearer <token>.',
      },
    });
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({
      ok: false,
      error: {
        textCode: 'UNAUTHORIZED',
        message: 'Invalid or expired token.',
      },
    });
    return;
  }

  req.user = { id: payload.sub, role: payload.role };
  next();
}

export function authorize(...roles: Array<User['role']>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        ok: false,
        error: { textCode: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        ok: false,
        error: { textCode: 'UNAUTHORIZED', message: 'You do not have permission to perform this action.' },
      });
      return;
    }
    next();
  };
}

import { Response } from 'express';
import { ErrorTextCode, Result } from '@/types/errors';

/**
 * Traduce un `Result<T>` de la capa de servicios a una respuesta HTTP,
 * respetando siempre el `status` definido en `ErrorService` (nunca un status
 * genérico fijo).
 */
export function sendResult<T>(res: Response, result: Result<T>, successStatus = 200): Response {
  if (!result.ok) {
    return res.status(result.error.status).json({
      ok: false,
      error: {
        textCode: result.error.textCode,
        message: result.error.message,
      },
    });
  }
  return res.status(successStatus).json({ ok: true, data: result.data });
}

/**
 * Respuesta de error para validaciones que ocurren en la capa HTTP (antes de
 * llegar a la capa de servicios), por ejemplo campos requeridos ausentes en
 * el body. Se reutiliza el textCode genérico de reglas de negocio, tal como
 * indica la convención del proyecto para no introducir nuevos ErrorTextCode.
 */
export function sendValidationError(res: Response, message: string, textCode: ErrorTextCode = 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES'): Response {
  return res.status(422).json({
    ok: false,
    error: { textCode, message },
  });
}

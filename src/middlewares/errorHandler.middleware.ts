import { NextFunction, Request, Response } from 'express';

/**
 * Manejador de errores de último recurso (fallback), para excepciones no
 * capturadas por la capa de servicios (por ejemplo, JSON malformado en el
 * body, parseado por `express.json()`, u otros errores inesperados lanzados
 * de forma síncrona/asíncrona por un controlador).
 *
 * La capa de servicios de este proyecto nunca lanza excepciones hacia arriba
 * (siempre devuelve `Result<T>`), así que este handler es una red de
 * seguridad y no la vía principal de manejo de errores.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  console.error('Unhandled error:', err);
  res.status(500).json({
    ok: false,
    error: {
      textCode: 'INTERNAL_ERROR',
      message: 'Unexpected internal server error.',
    },
  });
}

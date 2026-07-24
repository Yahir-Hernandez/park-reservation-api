import { Request, Response } from 'express';

/**
 * Handler para rutas no reconocidas por el router de Express.
 *
 * No se usa aquí ningún `ErrorTextCode` del dominio (USER_NOT_FOUND,
 * PARK_NOT_FOUND, etc.) porque esto ocurre a nivel de enrutamiento HTTP, sin
 * pasar por la capa de servicios/`Result<T>`; forzar un `textCode` del
 * dominio (o reutilizar 'INTERNAL_ERROR', que la tabla de mapeo reserva
 * exclusivamente para errores 500 reales) sería semánticamente incorrecto.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    ok: false,
    error: {
      message: `Route ${req.method} ${req.originalUrl} does not exist.`,
    },
  });
}

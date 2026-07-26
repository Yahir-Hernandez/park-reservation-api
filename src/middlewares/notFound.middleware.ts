import { Request, Response } from 'express';


export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    ok: false,
    error: {
      message: `Route ${req.method} ${req.originalUrl} does not exist.`,
    },
  });
}

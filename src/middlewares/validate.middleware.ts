// src/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(422).json({
        ok: false,
        error: {
          textCode: "VALIDATION_ERROR",
          message: result.error.issues.map((i) => i.message).join(", "),
        },
      });
    }

    req.body = result.data; 
    next();
  };
}
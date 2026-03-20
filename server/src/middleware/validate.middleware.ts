import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };

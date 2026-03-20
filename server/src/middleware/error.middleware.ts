import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendError } from "../utils/response";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Zod validation errors
  if (err instanceof ZodError) {
    sendError(res, "Validation failed", 422, err.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  // Known application errors
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Prisma known errors
  if ((err as any).code === "P2002") {
    sendError(res, "A record with that value already exists", 409);
    return;
  }

  // Unknown errors
  console.error("Unhandled error:", err);
  sendError(res, "Internal server error", 500);
};

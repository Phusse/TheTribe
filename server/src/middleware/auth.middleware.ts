import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JwtPayload } from "../utils/jwt";
import { sendError } from "../utils/response";

// Extend Express Request to carry our user payload
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendError(res, "Authentication required", 401);
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    sendError(res, "Invalid or expired token", 401);
  }
};

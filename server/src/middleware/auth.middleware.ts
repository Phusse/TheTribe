import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JwtPayload } from "../utils/jwt";
import { sendError } from "../utils/response";
import { prisma } from "../config/database";

// Extend Express Request to carry our user payload
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendError(res, "Authentication required", 401);
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;

    if (payload.role !== "SUPERADMIN") {
      const settings = await prisma.systemSettings.findFirst();
      if (settings?.maintenanceMode) {
        sendError(res, "The platform is currently undergoing maintenance. Please check back later.", 503);
        return;
      }
    }

    next();
  } catch (err) {
    // If it's a 503, don't say invalid token, let it pass
    sendError(res, "Invalid or expired token", 401);
  }
};

export const requireRole = (roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendError(res, "Insufficient permissions", 403);
      return;
    }
    next();
  };

import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

type Role = "MEMBER" | "ADMIN" | "SUPERADMIN";

// Role hierarchy: SUPERADMIN > ADMIN > MEMBER
const ROLE_RANK: Record<Role, number> = {
  MEMBER: 1,
  ADMIN: 2,
  SUPERADMIN: 3,
};

/**
 * Require the authenticated user to have at least the given role.
 * Use after the `authenticate` middleware.
 *
 * @example router.get("/admin/users", authenticate, requireRole("ADMIN"), handler)
 */
export const requireRole =
  (minimumRole: Role) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const userRank = ROLE_RANK[user.role as Role] ?? 0;
    const requiredRank = ROLE_RANK[minimumRole];

    if (userRank < requiredRank) {
      sendError(res, "Insufficient permissions", 403);
      return;
    }

    next();
  };

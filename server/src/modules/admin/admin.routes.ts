import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import {
  getStatsController,
  getUsersController,
  updateUserRoleController,
  toggleUserStatusController,
} from "./admin.controller";

const router = Router();

const UpdateRoleSchema = z.object({
  role: z.enum(["MEMBER", "ADMIN", "SUPERADMIN"]),
});

const ToggleStatusSchema = z.object({
  isActive: z.boolean(),
});

// All routes require SUPERADMIN access
router.use(authenticate, requireRole("SUPERADMIN"));

router.get("/stats", getStatsController);
router.get("/users", getUsersController);
router.patch("/users/:id/role", validate(UpdateRoleSchema), updateUserRoleController);
router.patch("/users/:id/status", validate(ToggleStatusSchema), toggleUserStatusController);

export { router as adminRouter };

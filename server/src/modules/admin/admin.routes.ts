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
  getSystemSettingsController,
  updateSystemSettingsController,
} from "./admin.controller";
import { UpdateSystemSettingsSchema } from "@thetribe/shared";
import { getReportsData } from "./admin.reports.service";
import { sendSuccess, sendError } from "../../utils/response";

const router = Router();

const UpdateRoleSchema = z.object({
  role: z.enum(["MEMBER", "ADMIN", "SUPERADMIN"]),
});

const ToggleStatusSchema = z.object({
  isActive: z.boolean(),
});

// Stats & Overviews (Allowed for ADMIN & SUPERADMIN)
router.get("/stats", authenticate, requireRole("ADMIN"), getStatsController);
router.get("/users", authenticate, requireRole("ADMIN"), getUsersController);
router.get("/reports", authenticate, requireRole("ADMIN"), async (_req, res) => {
  try {
    const data = await getReportsData();
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, "Failed to fetch reports", 500);
  }
});

// System Settings
router.get("/settings", authenticate, requireRole("ADMIN"), getSystemSettingsController);
router.patch("/settings", authenticate, requireRole("ADMIN"), validate(UpdateSystemSettingsSchema), updateSystemSettingsController);

// User Modification (Strictly SUPERADMIN)
router.patch("/users/:id/role", authenticate, requireRole("SUPERADMIN"), validate(UpdateRoleSchema), updateUserRoleController);
router.patch("/users/:id/status", authenticate, requireRole("SUPERADMIN"), validate(ToggleStatusSchema), toggleUserStatusController);

export { router as adminRouter };

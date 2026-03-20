import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { CreateModuleSchema, UpdateProgressSchema } from "@thetribe/shared";
import {
  getModulesController,
  updateProgressController,
  createModuleController,
} from "./training.controller";

const router = Router();

// Members access
router.get("/modules", authenticate, getModulesController);
router.patch("/progress", authenticate, validate(UpdateProgressSchema), updateProgressController);

// Admin / SuperAdmin access
router.post(
  "/modules",
  authenticate,
  requireRole("ADMIN"),
  validate(CreateModuleSchema),
  createModuleController
);

export { router as trainingRouter };

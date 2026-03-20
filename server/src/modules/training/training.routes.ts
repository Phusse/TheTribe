import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import {
  CreateModuleSchema,
  UpdateModuleSchema,
  CreateLessonSchema,
  UpdateLessonSchema,
  UpdateProgressSchema,
} from "@thetribe/shared";
import {
  getModulesController,
  updateProgressController,
  getAdminModulesController,
  createModuleController,
  updateModuleController,
  deleteModuleController,
  createLessonController,
  updateLessonController,
  deleteLessonController,
} from "./training.controller";

const router = Router();

// ── Member routes ─────────────────────────────────────────────────────────────
router.get("/modules", authenticate, getModulesController);
router.patch("/progress", authenticate, validate(UpdateProgressSchema), updateProgressController);

// ── Admin / SuperAdmin routes ─────────────────────────────────────────────────
router.get("/admin/modules", authenticate, requireRole("ADMIN"), getAdminModulesController);

router.post(
  "/modules",
  authenticate,
  requireRole("ADMIN"),
  validate(CreateModuleSchema),
  createModuleController
);
router.patch(
  "/modules/:id",
  authenticate,
  requireRole("ADMIN"),
  validate(UpdateModuleSchema),
  updateModuleController
);
router.delete("/modules/:id", authenticate, requireRole("ADMIN"), deleteModuleController);

router.post(
  "/lessons",
  authenticate,
  requireRole("ADMIN"),
  validate(CreateLessonSchema),
  createLessonController
);
router.patch(
  "/lessons/:id",
  authenticate,
  requireRole("ADMIN"),
  validate(UpdateLessonSchema),
  updateLessonController
);
router.delete("/lessons/:id", authenticate, requireRole("ADMIN"), deleteLessonController);

export { router as trainingRouter };

import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { UpdateProfileSchema, UpdateSettingsSchema } from "@thetribe/shared";
import {
  getProfileController,
  updateProfileController,
  updateSettingsController,
  getStatsController,
} from "./users.controller";

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Current user operations
router.get("/me", getProfileController);
router.patch("/me", validate(UpdateProfileSchema), updateProfileController);
router.patch("/me/settings", validate(UpdateSettingsSchema), updateSettingsController);
router.get("/me/stats", getStatsController);

export { router as usersRouter };

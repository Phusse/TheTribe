import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { RegisterSchema, LoginSchema, RefreshSchema } from "./auth.schema";
import {
  registerController,
  loginController,
  refreshController,
  logoutController,
  pledgeController,
  meController,
} from "./auth.controller";

const router = Router();

// Public routes
router.post("/register", validate(RegisterSchema), registerController);
router.post("/login", validate(LoginSchema), loginController);
router.post("/refresh", validate(RefreshSchema), refreshController);
router.post("/logout", logoutController);

// Protected routes
router.get("/me", authenticate, meController);
router.post("/pledge", authenticate, pledgeController);

export { router as authRouter };

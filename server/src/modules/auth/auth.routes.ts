import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import {
  RegisterSchema,
  LoginSchema,
  RefreshSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "./auth.schema";
import {
  registerController,
  loginController,
  refreshController,
  logoutController,
  pledgeController,
  meController,
  forgotPasswordController,
  resetPasswordController,
} from "./auth.controller";

const router = Router();

// Public routes
router.post("/register", validate(RegisterSchema), registerController);
router.post("/login", validate(LoginSchema), loginController);
router.post("/refresh", validate(RefreshSchema), refreshController);
router.post("/logout", logoutController);
router.post("/forgot-password", validate(ForgotPasswordSchema), forgotPasswordController);
router.post("/reset-password", validate(ResetPasswordSchema), resetPasswordController);

// Protected routes
router.get("/me", authenticate, meController);
router.post("/pledge", authenticate, pledgeController);

export { router as authRouter };

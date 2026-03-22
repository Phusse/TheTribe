import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import {
  getSessionsController,
  createSessionController,
} from "./sessions.controller";

const router = Router();

// Used mostly by the admin panel to create sessions
const CreateSessionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1),
  meetingUrl: z.string().url().or(z.literal("")).optional(),
  thumbnailUrl: z.string().optional(),
});

// All routes require authentication
router.use(authenticate);

// Members read access
router.get("/", getSessionsController);

// Admin / SuperAdmin create access
router.post(
  "/",
  requireRole("ADMIN"),
  validate(CreateSessionSchema),
  createSessionController
);

export { router as sessionsRouter };

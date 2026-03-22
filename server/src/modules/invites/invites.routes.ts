import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import {
  getInvitesController,
  getInviteAttemptsController,
  createInviteController,
  deleteInviteController,
} from "./invites.controller";

const router = Router();

// Only Admins and SuperAdmins can manage invites
router.use(authenticate, requireRole("ADMIN"));

const CreateInviteSchema = z.object({
  code: z.string().min(4).max(20).optional(),
});

router.get("/", getInvitesController);
router.get("/attempts", getInviteAttemptsController);
router.post("/", validate(CreateInviteSchema), createInviteController);
router.delete("/:id", deleteInviteController);

export { router as invitesRouter };

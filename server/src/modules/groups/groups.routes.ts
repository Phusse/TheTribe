import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import {
  getGroupsController,
  joinGroupController,
  leaveGroupController,
  getGroupMessagesController,
  sendGroupMessageController,
  createGroupController,
  updateGroupController,
  deleteGroupController,
} from "./groups.controller";

const router = Router();

const SendGroupMessageSchema = z.object({
  text: z.string().min(1).max(2000),
});

const CreateGroupSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().min(10).max(500),
});

const UpdateGroupSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().min(10).max(500).optional(),
});

// Inline role guard (avoids import issues with shared package during HMR)
const adminOnly = (req: any, res: any, next: any) => {
  if (!req.user || !["ADMIN", "SUPERADMIN"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Insufficient permissions" });
  }
  next();
};

// All routes require authentication
router.use(authenticate);

// ── List (everyone) ────────────────────────────────────────────────────────────
router.get("/", getGroupsController);

// ── Per-group member actions ───────────────────────────────────────────────────
router.post("/:id/join", joinGroupController);
router.post("/:id/leave", leaveGroupController);
router.get("/:id/messages", getGroupMessagesController);
router.post("/:id/messages", validate(SendGroupMessageSchema), sendGroupMessageController);

// ── Admin CRUD ─────────────────────────────────────────────────────────────────
router.post("/", adminOnly, validate(CreateGroupSchema), createGroupController);
router.patch("/:id", adminOnly, validate(UpdateGroupSchema), updateGroupController);
router.delete("/:id", adminOnly, deleteGroupController);

export { router as groupsRouter };

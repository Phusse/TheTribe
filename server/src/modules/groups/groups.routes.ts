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
} from "./groups.controller";

const router = Router();

const SendGroupMessageSchema = z.object({
  text: z.string().min(1).max(2000),
});

// All routes require authentication
router.use(authenticate);

router.get("/", getGroupsController);
router.post("/:id/join", joinGroupController);
router.post("/:id/leave", leaveGroupController);

router.get("/:id/messages", getGroupMessagesController);
router.post("/:id/messages", validate(SendGroupMessageSchema), sendGroupMessageController);

export { router as groupsRouter };

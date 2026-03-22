import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import {
  getConversationsController,
  getHistoryController,
  sendMessageController,
} from "./messages.controller";

const router = Router();

// Used for REST fallback before WebSockets fully wire up
const SendMessageSchema = z.object({
  text: z.string().min(1).max(2000),
});

// All routes require authentication
router.use(authenticate);

router.get("/conversations", getConversationsController);
router.get("/:partnerId/history", getHistoryController);
router.post("/:partnerId", validate(SendMessageSchema), sendMessageController);

export { router as messagesRouter };

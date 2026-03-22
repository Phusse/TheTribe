import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import {
  getConnectionsController,
  requestConnectionController,
  updateConnectionStatusController,
  removeConnectionController,
} from "./connections.controller";

const router = Router();

const RequestSchema = z.object({
  receiverId: z.string().cuid(),
});

const UpdateStatusSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
});

router.use(authenticate);

router.get("/", getConnectionsController);
router.post("/request", validate(RequestSchema), requestConnectionController);
router.patch("/:id/status", validate(UpdateStatusSchema), updateConnectionStatusController);
router.delete("/:id", removeConnectionController);

export { router as connectionsRouter };

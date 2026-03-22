import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { globalSearch } from "./search.service";
import { sendSuccess, sendError } from "../../utils/response";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const q = (req.query.q as string) || "";
    if (!q || q.length < 2) {
      sendSuccess(res, { members: [], training: [], sessions: [] });
      return;
    }
    const results = await globalSearch(q, req.user!.sub);
    sendSuccess(res, results);
  } catch (err) {
    sendError(res, "Search failed", 500);
  }
});

export { router as searchRouter };

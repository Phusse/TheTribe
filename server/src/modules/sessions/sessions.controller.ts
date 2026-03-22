import { Request, Response, NextFunction } from "express";
import * as sessionsService from "./sessions.service";
import { sendSuccess, sendCreated } from "../../utils/response";

export const getSessionsController = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessions = await sessionsService.getSessions();
    sendSuccess(res, sessions);
  } catch (err) {
    next(err);
  }
};

export const createSessionController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await sessionsService.createSession(req.body);
    sendCreated(res, session, "Session created");
  } catch (err) {
    next(err);
  }
};

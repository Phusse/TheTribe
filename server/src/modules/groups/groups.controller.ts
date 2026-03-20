import { Request, Response, NextFunction } from "express";
import * as groupsService from "./groups.service";
import { sendSuccess, sendCreated, sendError } from "../../utils/response";

export const getGroupsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const groups = await groupsService.getGroups(req.user!.sub);
    sendSuccess(res, groups);
  } catch (err) {
    next(err);
  }
};

export const joinGroupController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await groupsService.joinGroup(req.user!.sub, id as string);
    sendSuccess(res, null, "Joined group");
  } catch (err: any) {
    if (err.code === "P2002") {
      sendError(res, "Already a member of this group", 400);
      return;
    }
    next(err);
  }
};

export const leaveGroupController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await groupsService.leaveGroup(req.user!.sub, id as string);
    sendSuccess(res, null, "Left group");
  } catch (err: any) {
    if (err.code === "P2025") {
      sendError(res, "Not a member of this group", 400);
      return;
    }
    next(err);
  }
};

export const getGroupMessagesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const messages = await groupsService.getGroupMessages(req.user!.sub, id as string);
    sendSuccess(res, messages);
  } catch (err: any) {
    if (err.message.includes("member")) sendError(res, err.message, 403);
    else next(err);
  }
};

export const sendGroupMessageController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const msg = await groupsService.sendGroupMessage(req.user!.sub, id as string, text);
    sendCreated(res, msg, "Message sent");
  } catch (err: any) {
    if (err.message.includes("member")) sendError(res, err.message, 403);
    else next(err);
  }
};

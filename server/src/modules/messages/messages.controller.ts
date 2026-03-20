import { Request, Response, NextFunction } from "express";
import * as messagesService from "./messages.service";
import { sendSuccess, sendCreated } from "../../utils/response";

export const getConversationsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const convos = await messagesService.getConversations(req.user!.sub);
    sendSuccess(res, convos);
  } catch (err) {
    next(err);
  }
};

export const getHistoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { partnerId } = req.params;
    const history = await messagesService.getMessageHistory(req.user!.sub, partnerId as string);
    sendSuccess(res, history);
  } catch (err) {
    next(err);
  }
};

export const sendMessageController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { partnerId } = req.params;
    const { text } = req.body;
    const message = await messagesService.sendMessage(req.user!.sub, partnerId as string, text);
    sendCreated(res, message, "Message sent");
  } catch (err) {
    next(err);
  }
};

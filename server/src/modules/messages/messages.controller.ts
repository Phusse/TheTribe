import { Request, Response, NextFunction } from "express";
import * as messagesService from "./messages.service";
import { sendSuccess, sendCreated } from "../../utils/response";
import { io } from "../../index";
import { getSocketId } from "./messages.gateway";
import { prisma } from "../../config/database";

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
    const userId = req.user!.sub;

    const message = await messagesService.sendMessage(userId, partnerId as string, text);

    // Trigger real-time update
    const populatedMsg = await prisma.message.findUnique({
      where: { id: message.id },
      include: { sender: { select: { firstName: true, lastName: true } } }
    });

    const receiverSocketId = getSocketId(partnerId as string);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message:receive", populatedMsg);
    }

    sendCreated(res, message, "Message sent");
  } catch (err) {
    next(err);
  }
};

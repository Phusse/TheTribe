import { Request, Response, NextFunction } from "express";
import * as connectionsService from "./connections.service";
import { sendSuccess, sendCreated } from "../../utils/response";

export const getConnectionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const connections = await connectionsService.getConnections(req.user!.sub);
    sendSuccess(res, connections);
  } catch (err) {
    next(err);
  }
};

export const requestConnectionController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { receiverId } = req.body;
    const conn = await connectionsService.requestConnection(req.user!.sub, receiverId);
    sendCreated(res, conn, "Connection requested");
  } catch (err) {
    next(err);
  }
};

export const updateConnectionStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "accepted" | "rejected"
    const conn = await connectionsService.updateConnectionStatus(req.user!.sub, id as string, status);
    sendSuccess(res, conn, `Connection ${status}`);
  } catch (err) {
    next(err);
  }
};

export const removeConnectionController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await connectionsService.removeConnection(req.user!.sub, id as string);
    sendSuccess(res, null, "Connection removed");
  } catch (err) {
    next(err);
  }
};

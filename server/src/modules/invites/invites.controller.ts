import { Request, Response, NextFunction } from "express";
import * as invitesService from "./invites.service";
import { sendSuccess, sendCreated } from "../../utils/response";

export const getInvitesController = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const invites = await invitesService.getInvites();
    sendSuccess(res, invites);
  } catch (err) {
    next(err);
  }
};

export const createInviteController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code } = req.body;
    const invite = await invitesService.createInvite(req.user!.sub, code);
    sendCreated(res, invite, "Invite created");
  } catch (err) {
    next(err);
  }
};

export const deleteInviteController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await invitesService.deleteInvite(id);
    sendSuccess(res, null, "Invite deleted");
  } catch (err) {
    next(err);
  }
};
